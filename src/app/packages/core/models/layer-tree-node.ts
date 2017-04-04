export interface ILayerTreeNode {
    children: ILayerTreeNode[];
    name: string;
    id: number;
    isChecked: boolean;
}
