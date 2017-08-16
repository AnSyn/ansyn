export interface ILayerTreeNode {
    id: string;    
    name: string;
    isChecked: boolean;
    children: ILayerTreeNode[];
    isIndeterminate?: boolean;
    parent?: ILayerTreeNode;
};
