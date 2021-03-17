import _ from "lodash";
import { observer } from "mobx-react";
import React, { ReactElement } from "react";
import { Component } from "react";
import ReactDOM from "react-dom";
import { Area } from "./area";
import { Point } from "./point";

interface Props {
  showSelection: boolean;
  selectionPoints: Area;
  onSelectionChange?: (...args: any[]) => void;
}

interface State {
  showSelection: boolean;
  startPoint: any;
  endPoint: any;
  selectionBox: any;
  selectedItems: any;
  appendMode: any;
}

@observer
export default class SelectionArea extends Component<Props, State> {
  /**
   * Component initial state
   */

  constructor(props) {
    super(props);
    this.state = {
      ...this.clearState(),
      startPoint: this.props.selectionPoints.startPoint,
      endPoint: this.props.selectionPoints.endPoint,
    };
  }

  clearState = () => {
    return {
      showSelection: false,
      startPoint: null,
      endPoint: null,
      selectionBox: null,
      selectedItems: {},
      appendMode: false,
    };
  };

  selectedChildren: any = {};

  componentDidUpdate(prevProps, prevState) {
    if (this.props.selectionPoints.startPoint.x !== this.state.startPoint.x) {
      this.updateSelection(
        this.props.selectionPoints.startPoint,
        this.props.selectionPoints.endPoint,
      );
    }
    if (!_.isNull(this.state.selectionBox)) {
      this._updateCollidingChildren(this.state.selectionBox);
      this.props.onSelectionChange.call(null, _.keys(this.selectedChildren));
    }
  }
  /**
   * On component props change
   */
  // componentWillReceiveProps = (nextProps: any) => {
  //   let nextState: any = {};
  //   if(!nextProps.enabled) {
  //     nextState.selectedItems = {};
  //   }
  //   this.setState(nextState);
  // };

  /**
   * On root element mouse down
   */
  // _onMouseDown = (e) => {
  //   if(!this.props.enabled || e.button === 2 || e.nativeEvent.which === 2) {
  //     return;
  //   }
  //   var nextState = {};
  //   if(e.ctrlKey || e.altKey || e.shiftKey) {
  //     nextState.appendMode = true;
  //   }
  //   nextState.mouseDown = true;
  //   nextState.startPoint = {
  //     x: e.pageX,
  //     y: e.pageY
  //   };
  //   this.setState(nextState);
  //   window.document.addEventListener('mousemove', this._onMouseMove);
  //   window.document.addEventListener('mouseup', this._onMouseUp);
  // };

  /**
   * On document element mouse up
   */
  // _onMouseUp = (e) => {
  //   window.document.removeEventListener('mousemove', this._onMouseMove);
  //   window.document.removeEventListener('mouseup', this._onMouseUp);
  //   this.setState({
  //     mouseDown: false,
  //     startPoint: null,
  //     endPoint: null,
  //     selectionBox: null,
  //     appendMode: false
  //   });
  //   this.props.onSelectionChange.call(null, _.keys(this.selectedChildren));
  // };

  // /**
  //  * On document element mouse move
  //  */
  // _onMouseMove = (e) => {
  //   e.preventDefault();
  //   if(this.state.mouseDown) {
  //     var endPoint = {
  //       x: e.pageX,
  //       y: e.pageY
  //     };
  //     this.setState({
  //       endPoint: endPoint,
  //       selectionBox: this._calculateSelectionBox(this.state.startPoint, endPoint)
  //     });
  //   }
  // };

  updateSelection = (startPoint: Point, endPoint: Point) => {
    this.setState({
      startPoint,
      endPoint,
      selectionBox: this._calculateSelectionBox(
        startPoint,
        endPoint
      ),
    });
  };
  /**
   * Render
   */
  render = () => {
    return (
      <div className="selection" ref="selectionBox">
        {this.renderChildren()}
        {this.renderSelectionBox()}
      </div>
    );
  };

  /**
   * Render children
   */
  renderChildren = () => {
    var index = 0;
    var _this = this;
    var tmpChild;
    return React.Children.map(this.props.children, (child) => {
      var tmpKey = _.isNull((child as any).key) ? index++ : (child as any).key;
      var isSelected = _.has(_this.selectedChildren, tmpKey);
      tmpChild = React.cloneElement(child as ReactElement, {
        ref: tmpKey,
        selectionparent: _this,
        isselected: isSelected.toString(),
      });
      return React.createElement(
        "div",
        {
          className: "select-box " + (isSelected ? "selected" : ""),
          onClickCapture: (e) => {
            // if((e.ctrlKey || e.altKey || e.shiftKey) && _this.props.enabled) {
            //   e.preventDefault();
            //   e.stopPropagation();
            //   _this.selectItem(tmpKey, !_.has(_this.selectedChildren, tmpKey));
            // }
          },
        },
        tmpChild
      );
    });
  };

  /**
   * Render selection box
   */
  renderSelectionBox = () => {
    if (
      !this.props.showSelection ||
      _.isNull(this.state.endPoint) ||
      _.isNull(this.state.startPoint)
    ) {
      return null;
    }
    return (
      <div className="selection-border" style={this.state.selectionBox}></div>
    );
  };

  /**
   * Manually update the selection status of an item
   * @param {string} key the item's target key value
   * @param {boolean} isSelected the item's target selection status
   */
  selectItem = (key: any, isSelected: any) => {
    if (isSelected) {
      this.selectedChildren[key] = isSelected;
    } else {
      delete this.selectedChildren[key];
    }
    this.props.onSelectionChange.call(null, _.keys(this.selectedChildren));
    this.forceUpdate();
  };

  /**
   * Manually clear selected items
   */
  clearSelection = () => {
    this.selectedChildren = {};
    this.setState(this.clearState());
    this.props.onSelectionChange.call(null, []);
    this.forceUpdate();
  };

  /**
   * Detect 2D box intersection
   */
  _boxIntersects = function (boxA: any, boxB: any) {
    if (
      boxA.left <= boxB.left + boxB.width &&
      boxA.left + boxA.width >= boxB.left &&
      boxA.top <= boxB.top + boxB.height &&
      boxA.top + boxA.height >= boxB.top
    ) {
      return true;
    }
    return false;
  };

  /**
   * Updates the selected items based on the
   * collisions with selectionBox
   */
  _updateCollidingChildren = (selectionBox: any) => {
    var tmpNode = null;
    var tmpBox = null;
    var _this = this;
    _.each(this.refs, function (ref: any, key: any) {
      if (key !== "selectionBox") {
        tmpNode = ReactDOM.findDOMNode(ref);
        tmpBox = {
          top: tmpNode.offsetTop,
          left: tmpNode.offsetLeft,
          width: tmpNode.clientWidth,
          height: tmpNode.clientHeight
        };
        if (_this._boxIntersects(selectionBox, tmpBox)) {
          _this.selectedChildren[key] = true;
        } else {
          if (!_this.state.appendMode) {
            delete _this.selectedChildren[key];
          }
        }
      }
    });
  };

  /**
   * Calculate selection box dimensions
   */
  _calculateSelectionBox = (startPoint: Point, endPoint: Point) => {
    if (_.isNull(endPoint) || _.isNull(startPoint)) {
      return null;
    }
    // var parentNode = this.refs.selectionBox.getDOMNode();
    var left = Math.min(startPoint.x, endPoint.x); // - parentNode.offsetLeft;
    var top = Math.min(startPoint.y, endPoint.y) - 18; // - parentNode.offsetTop;
    var width = Math.abs(startPoint.x - endPoint.x);
    var height = Math.abs(startPoint.y - endPoint.y);
    return {
      left: left,
      top: top,
      width: width,
      height: height,
    };
  };
}
