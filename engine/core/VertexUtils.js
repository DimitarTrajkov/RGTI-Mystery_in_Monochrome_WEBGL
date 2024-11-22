import { Accessor } from './Accessor.js';

export function parseFormat(format) {
    const regex = /(?<type>float|((?<sign>u|s)(?<norm>int|norm)))(?<bits>\d+)x(?<count>\d+)/;
    const groups = format.match(regex).groups;

    return {
        componentType: groups.type === 'float' ? 'float' : 'int',
        componentNormalized: groups.norm === 'norm',
        componentSigned: groups.sign === 's',
        componentSize: Number(groups.bits) / 8,
        componentCount: Number(groups.count),
    };
}

export function createVertexBuffer(vertices, layout) {
    // buffero will be layoutStride ( data for one vertex in bytes) * num of vertices
    const buffer = new ArrayBuffer(layout.arrayStride * vertices.length);
    
    const accessors = layout.attributes.map(attribute => new Accessor({
        buffer,
        stride: layout.arrayStride,
        ...parseFormat(attribute.format),
        ...attribute,
    }));
    // console.log(vertices[1]["texcoords"]);
    // console.log(layout.attributes[1].name);
    for (let i = 0; i < vertices.length; i++) {
        const vertex = vertices[i];
        // debug
        // console.log("creating the vertex buffer:",vertex["texcoords"]);
        if(vertex["texcoords"][0] > 1 || vertex["texcoords"][1] > 1) {
            // console.log(vertex["texcoords"]);
        }
        // debug end
        for (let j = 0; j < layout.attributes.length; j++) {
            const accessor = accessors[j];
            const attribute = layout.attributes[j].name;
            accessor.set(i, vertex[attribute]);
        }
    }
    return buffer;
}
