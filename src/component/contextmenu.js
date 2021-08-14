import { h } from './element';
import { bindClickoutside, unbindClickoutside } from './event';
import { cssPrefix } from '../config';
import { tf } from '../locale/locale';

const defaultMenuItems = [
  { key: 'copy', title: tf('contextmenu.copy'), label: 'Ctrl+C' },
  { key: 'cut', title: tf('contextmenu.cut'), label: 'Ctrl+X' },
  { key: 'paste', title: tf('contextmenu.paste'), label: 'Ctrl+V' },
  { key: 'paste-value', title: tf('contextmenu.pasteValue'), label: 'Ctrl+Shift+V' },
  { key: 'paste-format', title: tf('contextmenu.pasteFormat'), label: 'Ctrl+Alt+V' },
  { key: 'divider' },
  { key: 'insert-row', title: tf('contextmenu.insertRow') },
  { key: 'insert-column', title: tf('contextmenu.insertColumn') },
  { key: 'divider' },
  { key: 'delete-row', title: tf('contextmenu.deleteRow') },
  { key: 'delete-column', title: tf('contextmenu.deleteColumn') },
  { key: 'delete-cell-text', title: tf('contextmenu.deleteCellText') },
  { key: 'hide', title: tf('contextmenu.hide'), available: mode => mode === 'col-title' || mode === 'row-title' },
  { key: 'divider' },
  { key: 'validation', title: tf('contextmenu.validation') },
  { key: 'divider' },
  { key: 'cell-printable', title: tf('contextmenu.cellprintable') },
  { key: 'cell-non-printable', title: tf('contextmenu.cellnonprintable') },
  { key: 'divider' },
  { key: 'cell-editable', title: tf('contextmenu.celleditable') },
  { key: 'cell-non-editable', title: tf('contextmenu.cellnoneditable') },
];

function buildMenuItem(item) {
  if (item.key === 'divider') {
    return h('div', `${cssPrefix}-item divider`);
  }
  return h('div', `${cssPrefix}-item`)
    .on('click', () => {
      this.itemClick(item.key, item.handler);
      this.hide();
    })
    .children(
      item.title(),
      h('div', 'label').child(item.label || ''),
    );
}

function buildMenu(menuItems) {
  return menuItems.map(it => buildMenuItem.call(this, it));
}

export default class ContextMenu {
  constructor(viewFn, menuItems = defaultMenuItems, isHide = false) {
    this.menuItemOptions = menuItems;
    this.menuItems = buildMenu.call(this, menuItems);
    this.el = h('div', `${cssPrefix}-contextmenu`)
      .children(...this.menuItems)
      .hide();
    this.viewFn = viewFn;
    this.itemClick = () => {};
    this.isHide = isHide;
    this.setMode('range');
  }

  // col-title: the whole rows
  // row-title: the whole cols
  // range: select range
  setMode(mode) {
    const availableMenuItems = [];
    this.menuItemOptions.forEach(({ available }, index) => {
      let itemVisible;
      if (typeof available === 'function') {
        itemVisible = available(mode);
      } else {
        itemVisible = available !== false;
      }
      const menuItem = this.menuItems[index];
      if (itemVisible) {
        availableMenuItems.push(menuItem);
        menuItem.show();
      } else {
        menuItem.hide();
      }
    });
    this.availableMenuItems = availableMenuItems;
  }

  hide() {
    const { el } = this;
    el.hide();
    unbindClickoutside(el);
  }

  setPosition(x, y) {
    if (this.isHide || this.availableMenuItems.length === 0) return;
    const { el } = this;
    const { width } = el.show().offset();
    const view = this.viewFn();
    const vhf = view.height / 2;
    let left = x;
    if (view.width - x <= width) {
      left -= width;
    }
    el.css('left', `${left}px`);
    if (y > vhf) {
      el.css('bottom', `${view.height - y}px`)
        .css('max-height', `${y}px`)
        .css('top', 'auto');
    } else {
      el.css('top', `${y}px`)
        .css('max-height', `${view.height - y}px`)
        .css('bottom', 'auto');
    }
    bindClickoutside(el);
  }
}
