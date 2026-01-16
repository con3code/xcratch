/**
 * Blocks to Image - Export blocks as SVG/PNG images
 * Based on TurboWarp's blocks2image addon
 */

let initialized = false;
let ScratchBlocks = null;
let intl = null;

const createExampleSVG = () => {
    const exSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    exSVG.setAttribute('xmlns:html', 'http://www.w3.org/1999/xhtml');
    exSVG.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
    exSVG.setAttribute('version', '1.1');
    return exSVG;
};

const makeStyle = () => {
    const style = document.createElement('style');
    style.textContent = `
    .blocklyText {
        fill: ${ScratchBlocks.Colours.text};
        font-family: "Helvetica Neue", Helvetica, sans-serif;
        font-size: 12pt;
        font-weight: 500;
    }
    .blocklyNonEditableText>text, .blocklyEditableText>text {
        fill: ${ScratchBlocks.Colours.textFieldText};
    }
    .blocklyDropdownText {
        fill: ${ScratchBlocks.Colours.text} !important;
    }
    `;
    return style;
};

const setCSSVars = element => {
    for (const property of document.documentElement.style) {
        if (property.startsWith('--editorTheme3-')) {
            element.style.setProperty(property, document.documentElement.style.getPropertyValue(property));
        }
    }
};

const exportData = (text, filename) => {
    const saveLink = document.createElement('a');
    document.body.appendChild(saveLink);

    const data = new Blob([text], {type: 'text'});
    const url = window.URL.createObjectURL(data);
    saveLink.href = url;

    const date = new Date();
    const timestamp = `${date.toLocaleDateString()}-${date.toLocaleTimeString()}`;
    saveLink.download = `${filename}_${timestamp}.svg`;
    saveLink.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(saveLink);
};

const exportPNG = (svg, filename) => {
    const serializer = new XMLSerializer();

    const iframe = document.createElement('iframe');
    document.body.append(iframe);
    iframe.contentDocument.write(serializer.serializeToString(svg));
    const {width, height} = iframe.contentDocument.body.querySelector('svg g').getBoundingClientRect();
    svg.setAttribute('width', `${width}px`);
    svg.setAttribute('height', `${height}px`);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const img = document.createElement('img');

    img.setAttribute(
        'src',
        `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(serializer.serializeToString(svg))))}`
    );
    img.onload = function () {
        canvas.height = img.height;
        canvas.width = img.width;
        ctx.drawImage(img, 0, 0, img.width, img.height);
        const dataURL = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        const date = new Date();
        const timestamp = `${date.toLocaleDateString()}-${date.toLocaleTimeString()}`;

        link.download = `${filename}_${timestamp}.png`;
        link.href = dataURL;
        link.click();
        iframe.remove();
    };
};

const selectedBlocks = (isExportPNG, block) => {
    const svg = createExampleSVG();

    let svgchild = block.svgGroup_;
    svgchild = svgchild.cloneNode(true);
    const dataShapes = svgchild.getAttribute('data-shapes');
    let translateY = 0;
    const scale = isExportPNG ? 2 : 1;
    if (dataShapes === 'c-block c-1 hat') {
        translateY = 20;
    }
    if (dataShapes === 'hat') {
        translateY = 16;
        if (block.CAT_BLOCKS) {
            translateY += 16;
        }
    }
    svgchild.setAttribute('transform', `translate(0,${scale * translateY}) scale(${scale})`);
    setCSSVars(svg);
    svg.append(makeStyle());
    svg.append(svgchild);
    return svg;
};

const allBlocks = isExportPNG => {
    const svg = createExampleSVG();

    const svgchild = document.querySelector('svg.blocklySvg g.blocklyBlockCanvas');
    const clonedChild = svgchild.cloneNode(true);

    const xArr = [];
    const yArr = [];

    clonedChild.childNodes.forEach(g => {
        const transform = g.getAttribute('transform');
        const match = transform.match(/translate\((.*?),(.*?)\)/);
        const x = match ? match[1] : 0;
        const y = match ? match[2] : 0;
        xArr.push(x * (isExportPNG ? 2 : 1));
        yArr.push(y * (isExportPNG ? 2 : 1));
        g.style.display = '';
    });

    clonedChild.setAttribute(
        'transform',
        `translate(${-Math.min(...xArr)},${-Math.min(...yArr) + (18 * (isExportPNG ? 2 : 1))}) ${
            isExportPNG ? 'scale(2)' : ''
        }`
    );
    setCSSVars(svg);
    svg.append(makeStyle());
    svg.append(clonedChild);
    return svg;
};

const exportBlock = async (isExportPNG, block) => {
    let svg;
    if (block) {
        svg = selectedBlocks(isExportPNG, block);
    } else {
        svg = allBlocks(isExportPNG);
    }

    svg.querySelectorAll('text').forEach(text => {
        text.innerHTML = text.innerHTML.replace(/&nbsp;/g, ' ');
    });

    await Promise.all(
        Array.from(svg.querySelectorAll('image')).map(async item => {
            const iconUrl = item.getAttribute('xlink:href');
            if (iconUrl.startsWith('data:')) return;
            const blob = await (await fetch(iconUrl)).blob();
            const reader = new FileReader();
            const dataUri = await new Promise(resolve => {
                reader.addEventListener('load', () => resolve(reader.result));
                reader.readAsDataURL(blob);
            });
            item.setAttribute('xlink:href', dataUri);
        })
    );

    const filename = block ? 'block' : 'blocks';
    if (isExportPNG) {
        exportPNG(svg, filename);
    } else {
        exportData(new XMLSerializer().serializeToString(svg), filename);
    }
};

const addContextMenuItems = (items, block) => {
    const svgchild = document.querySelector('svg.blocklySvg g.blocklyBlockCanvas');
    const hasBlocks = !!svgchild?.childNodes?.length;

    if (block) {
        items.push({
            enabled: true,
            text: intl.formatMessage({
                id: 'xcratch.blocks2image.export_selected_to_SVG',
                defaultMessage: 'Export selected blocks to SVG',
                description: 'Context menu item to export selected blocks as SVG'
            }),
            callback: () => exportBlock(false, block),
            separator: true
        });
        items.push({
            enabled: true,
            text: intl.formatMessage({
                id: 'xcratch.blocks2image.export_selected_to_PNG',
                defaultMessage: 'Export selected blocks to PNG',
                description: 'Context menu item to export selected blocks as PNG'
            }),
            callback: () => exportBlock(true, block),
            separator: false
        });
    } else {
        items.push({
            enabled: hasBlocks,
            text: intl.formatMessage({
                id: 'xcratch.blocks2image.export_all_to_SVG',
                defaultMessage: 'Export all blocks to SVG',
                description: 'Context menu item to export all blocks as SVG'
            }),
            callback: () => exportBlock(false),
            separator: true
        });
        items.push({
            enabled: hasBlocks,
            text: intl.formatMessage({
                id: 'xcratch.blocks2image.export_all_to_PNG',
                defaultMessage: 'Export all blocks to PNG',
                description: 'Context menu item to export all blocks as PNG'
            }),
            callback: () => exportBlock(true),
            separator: false
        });
    }
    return items;
};

/**
 * Initialize blocks to image functionality
 * @param {object} scratchBlocks - The ScratchBlocks object
 * @param {object} formatMessage - The intl formatMessage function
 */
export const initializeBlocksToImage = (scratchBlocks, formatMessage) => {
    if (initialized) return;
    
    ScratchBlocks = scratchBlocks;
    intl = {formatMessage};
    
    const originalShow = ScratchBlocks.ContextMenu.show;
    ScratchBlocks.ContextMenu.show = function (event, items, rtl) {
        const gesture = ScratchBlocks.mainWorkspace?.currentGesture_;
        const block = gesture?.targetBlock_;
        
        items = addContextMenuItems(items, block);
        
        originalShow.call(this, event, items, rtl);
    };
    
    initialized = true;
};
