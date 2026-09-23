import React from "react";
import { shortHash } from "../utils/hash.js";

// Row rendering used in the blockchain explorer's block list.
export default function BlockCard({ block, onOpen }) {
  return (
    <div className="block-row" onClick={() => onOpen(block.index)} role="button">
      <div className="bnum">#{String(block.index).padStart(6, "0")}</div>
      <div className="bhash">
        <span className="blabel">Hash</span>
        {shortHash(block.hash)}
      </div>
      <div className="bhash">
        <span className="blabel">Previous Hash</span>
        {shortHash(block.prevHash)}
      </div>
      <div className="bhash">
        <span className="blabel">Txns</span>
        {block.txCount}
      </div>
      <div className="bhash">
        <span className="blabel">Validator</span>
        {block.validator}
      </div>
    </div>
  );
}
