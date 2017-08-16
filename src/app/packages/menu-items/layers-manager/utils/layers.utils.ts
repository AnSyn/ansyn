import { ILayerTreeNode } from '@ansyn/core';

export type nodesFilterFunc = (node: ILayerTreeNode, metadata: any) => boolean;

export function findNodesByFilterFunc(layers: ILayerTreeNode[], filterFunc: nodesFilterFunc, metadata: any): ILayerTreeNode[] {
    let foundNodes: ILayerTreeNode[] = [];

    for (let index = 0; index < layers.length; index++) {
        let currentLayer = layers[index];

        if (filterFunc(currentLayer, metadata)) {
            foundNodes.push(currentLayer);
        } else if (currentLayer.children && currentLayer.children.length > 0) {
            foundNodes.push(...findNodesByFilterFunc(currentLayer.children, filterFunc, metadata));
        }
    }

    return foundNodes;
}

export function idFilterFunc(node: ILayerTreeNode, metadata: any): boolean {
    return node.id === metadata;
}

export function checkedAndLeafFilterFunc(node: ILayerTreeNode, metadata: any): boolean {
    return node.isChecked === metadata && (!node.children || node.children.length === 0);
}

export function leafFilterFunction(node: ILayerTreeNode, metadata: any): boolean {
    return (!node.children || node.children.length === 0);
}

export function connectParents(layers: ILayerTreeNode[]): void {
    layers.forEach((layer: ILayerTreeNode) => {
        layer.children.forEach((child: ILayerTreeNode) => {
            child.parent = layer;
        });

        if (layer.children) {
            connectParents(layer.children);
        }
    });
}

export function removeParents(layers: ILayerTreeNode[]): void {
    layers.forEach((layer: ILayerTreeNode) => {
        delete layer['parent'];

        if (layer.children) {
            removeParents(layer.children);
        }
    });
}

export function turnIndeterminateOff(layer: ILayerTreeNode): void {
    layer.isIndeterminate = false;
    layer.children.forEach((child) => turnIndeterminateOff(child));
}

export function bubbleIndeterminateUp(layer: ILayerTreeNode): void {
    if (!layer) {
        return;
    }

    layer.isIndeterminate = isNodeIndeterminate(layer);
    if (layer.parent) {
        bubbleIndeterminateUp(layer.parent);
    }
}

export function isNodeIndeterminate(layer: ILayerTreeNode): boolean {
    if (!layer.children || layer.children.length === 0) {
        return false;
    }

    if (layer.children.every(child => child.isChecked) || layer.children.every(child => !child.isChecked)) {
        return false;
    } else {
        return true;
    }
}

export function bubbleActivationDown(layer: ILayerTreeNode, activationValue: boolean) {

    layer.children.filter(child => child.isChecked !== activationValue).forEach(child => {
        child.isChecked = activationValue;
        bubbleActivationDown(child, activationValue);
    });
}

export function bubbleActivationUp(layer: ILayerTreeNode, newValue: boolean): void {
    if (!layer) {
        return;
    }

    if ((newValue && layer.children.every(child => child.isChecked === newValue)) ||
        (!newValue && layer.children.some(child => child.isChecked === newValue))) {
        layer.isChecked = newValue;
        bubbleActivationUp(layer.parent, newValue);
    }
}


