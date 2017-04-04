import { ILayerTreeNode } from '../models/layer-tree-node';

export const DATA_LAYERS: ILayerTreeNode[] = [
    {
        name: 'Fields',
        id: 1,
        isChecked: false,
        children: [{
            name: 'Rice Fields', id: 2, isChecked: false, children: [{ name: 'Brown Rice', id: 5, isChecked: false, children: [] },
            { name: 'Persian Rice', id: 6, isChecked: false, children: [] }]
        },
        { name: 'Wheat Fields', id: 3, isChecked: true, children: [] },
        { name: 'Oat Fields', id: 4, isChecked: false, children: [] }]
    }
];