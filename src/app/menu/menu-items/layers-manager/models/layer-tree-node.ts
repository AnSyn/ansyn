export interface ILayerTreeNode {
    parent: ILayerTreeNode;
    children: ILayerTreeNode[];
    name: string;
    id: number;
}
