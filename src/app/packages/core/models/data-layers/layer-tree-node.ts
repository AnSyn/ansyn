export interface ILayerTreeNode {
    children: ILayerTreeNode[];
    name: string;
    id: string;
    isChecked: boolean;
    isIndeterminate: boolean;
};
