import React, { ChangeEvent, ChangeEventHandler, Component, MouseEventHandler } from "react";
import logo from "./logo.svg";
import "./App.css";
import classNames from "classnames";
import { observer } from "mobx-react";
import Papa, { ParseResult } from "papaparse";
import { observable } from "mobx";
import { Rnd } from "react-rnd";

@observer
export default class App extends Component {
  @observable
  parsedTable: ParseResult<unknown> | null = null;

  boxes: { text: string }[] = [];
  componentDidMount() {}
  loadFile = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.currentTarget.files) return;

    var file = e.currentTarget.files[0] || null;
    console.log(file);
    Papa.parse(file, {
      complete: (parsedOutput) => {
        this.parsedTable = parsedOutput;
        this.setState({...this.state, parsedTable: this.parsedTable });
        console.log(this.parsedTable);
      },
    });
  };

  addBox = () => {
    this.boxes.push({ text: "test" });
    this.setState({...this.state, boxes: this.boxes });
  };

  renderTableData() {
    if (!this.parsedTable) return <></>;
    let test = this.parsedTable.data.map((row, index) => {
      return (
        <tr key={index}>
          {(row as Array<string>).map((cell, index) => (
            <td key={index}>{cell}</td>
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
          style={{ zIndex: index, backgroundColor: "azure", border: "1px solid red" }}
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
        <div className="">
          <input type="file" accept=".csv" onChange={this.loadFile} />
          <button onClick={this.addBox}>Add text</button>
        </div>
        <div className={classNames("border", "top")}></div>
        <div className={classNames("border", "right")}></div>
        <div className={classNames("border", "bottom")}></div>
        <div className={classNames("border", "left")}></div>
        <div>
          <Rnd disableDragging={true}>
            test
            <table className="example-table">
              <tbody>{this.renderTableData()}</tbody>
            </table>
          </Rnd>
        </div>
        <div>
          {this.renderBoxes()}
        </div>
      </div>
    );
  }
}
