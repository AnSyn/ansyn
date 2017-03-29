import { Injectable } from '@angular/core';
import { TREE_ACTIONS, KEYS, IActionMapping } from 'angular-tree-component';

@Injectable()
export class TreeActionMappingServiceService {

  public getActionMapping(): IActionMapping {
    return {
      mouse: {
        click: TREE_ACTIONS.TOGGLE_SELECTED_MULTI,
        dblClick: null,
        contextMenu: null,
        expanderClick: TREE_ACTIONS.TOGGLE_EXPANDED,
        drop: TREE_ACTIONS.MOVE_NODE
      },
      keys: {
        [KEYS.RIGHT]: TREE_ACTIONS.DRILL_DOWN,
        [KEYS.LEFT]: TREE_ACTIONS.DRILL_UP,
        [KEYS.DOWN]: TREE_ACTIONS.NEXT_NODE,
        [KEYS.UP]: TREE_ACTIONS.PREVIOUS_NODE,
        [KEYS.SPACE]: TREE_ACTIONS.TOGGLE_SELECTED,
        [KEYS.ENTER]: TREE_ACTIONS.TOGGLE_SELECTED
      }
    };
  }
}
