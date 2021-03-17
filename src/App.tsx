import React, { ChangeEvent, Component } from "react";
import "./App.scss";
import classNames from "classnames";
import { observer } from "mobx-react";
import Papa, { ParseResult } from "papaparse";
import { observable } from "mobx";
import { Rnd } from "react-rnd";
import SelectionArea from "./SelectionArea";
import { Area } from "./area";
import _ from "lodash";

interface State {
  selectionPointsToCrop: Area;
  parsedTable: ParseResult<unknown> | null;
  boxes: { text: string }[];
}

@observer
export default class App extends Component<{}, State> {
  @observable
  parsedTable: ParseResult<unknown> | null = null;

  @observable
  boxes: { text: string }[] = [];

  selectionPointsTemp: Area = {
    startPoint: { x: 0, y: 5 },
    endPoint: { x: 900, y: 700 },
  };
  selectedChildren: string[];

  constructor(props) {
    super(props);

    this.state = {
      boxes: [],
      parsedTable: null,
      selectionPointsToCrop: {
        startPoint: { x: 0, y: 5 },
        endPoint: { x: 900, y: 700 },
      },
    };
  }

  loadFile = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.currentTarget.files) return;

    var file = e.currentTarget.files[0] || null;
    console.log(file);
    Papa.parse(file, {
      complete: (parsedOutput) => {
        this.parsedTable = parsedOutput;
        this.setState({ ...this.state, parsedTable: this.parsedTable });
        console.log(this.parsedTable);
      },
    });
  };

  addBox = () => {
    this.boxes.push({ text: "test" });
    this.setState({ ...this.state, boxes: this.boxes });
  };

  setSelectedItems = (values: string[]) => {
    this.selectedChildren = values;
  };

  deleteSelection = () => {
    let tempTable = [];
    for (let i = 0; i < this.parsedTable.data.length; i++) {
      if (!this.selectedChildren.includes(i.toString())) {
        tempTable.push(this.parsedTable.data[i]);
      }
    }
    this.parsedTable.data = tempTable;
    this.setState({ ...this.state, parsedTable: this.parsedTable });
  };

  showSelection = () => {
    this.setState({
      ...this.state,
      selectionPointsToCrop: _.cloneDeep(this.selectionPointsTemp),
    });
  };

  renderTableData() {
    if (!this.parsedTable) return <></>;
    let test = this.parsedTable.data.map((row, indexRow) => {
      return (
        <tr key={indexRow} className="responsive-table-row">
          {(row as Array<string>).map((cell, indexCell) => (
            <td
              className="responsive-table-cell"
              key={`${indexRow}-${indexCell}`}
            >
              {cell}
            </td>
          ))}
        </tr>
      );
    });
    return test;
  }

  renderBoxes() {
    let test = this.boxes.map((box, index) => {
      return (
        <Rnd
          key={index}
          className="responsive-text-box"
          style={{ zIndex: index }}
          default={{
            x: 0,
            y: 0,
            width: 200,
            height: 200,
          }}
        >
          Box {index}
        </Rnd>
      );
    });
    return test;
  }
  render() {
    return (
      <div className="App">
        <div className="appWrapper">
          <input type="file" accept=".csv" onChange={this.loadFile} />
          <button onClick={this.addBox}>Add text box</button>
          <button onClick={this.showSelection}>Show selection</button>
          <button onClick={this.deleteSelection}>Delete selection</button>
        </div>
        <Rnd
          onDragStop={(e, d) => {
            this.selectionPointsTemp.startPoint.y = d.y;
          }}
          default={{
            x: 0,
            y: 50,
            width: "100%",
            height: "5px",
          }}
          dragAxis="y"
          enableResizing={false}
          className={classNames("selectionBorder", "top")}
        ></Rnd>
        <Rnd
          onDragStop={(e, d) => {
            this.selectionPointsTemp.endPoint.x = d.x;
          }}
          default={{
            x: 1100,
            y: 0,
            width: "5px",
            height: "100%",
          }}
          dragAxis="x"
          enableResizing={false}
          className={classNames("selectionBorder", "right")}
        ></Rnd>
        <Rnd
          onDragStop={(e, d) => {
            this.selectionPointsTemp.endPoint.y = d.y;
          }}
          default={{
            x: 0,
            y: 700,
            width: "100%",
            height: "5px",
          }}
          dragAxis="y"
          enableResizing={false}
          className={classNames("selectionBorder", "bottom")}
        ></Rnd>
        <Rnd
          onDragStop={(e, d) => {
            this.selectionPointsTemp.startPoint.x = d.x;
          }}
          default={{
            x: 0,
            y: 0,
            width: "5px",
            height: "100%",
          }}
          dragAxis="x"
          enableResizing={false}
          className={classNames("selectionBorder", "left")}
        ></Rnd>
        <div>
          <Rnd disableDragging={true}>
            <table className="responsive-table">
              <tbody className="responsive-table-body">
                <SelectionArea
                  showSelection={true}
                  onSelectionChange={this.setSelectedItems}
                  selectionPoints={this.state.selectionPointsToCrop}
                >
                  {this.renderTableData()}
                </SelectionArea>
              </tbody>
            </table>
          </Rnd>
        </div>
        <div>{this.renderBoxes()}</div>
      </div>
    );
  }
}
