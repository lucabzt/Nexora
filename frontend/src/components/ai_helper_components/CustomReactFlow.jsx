import * as RF from "@xyflow/react";
import React from "react";

// Helper function to find the scrollable parent
const findScrollableParent = (element) => {
  if (!element || element === document.body) {
    return document.documentElement || document.body;
  }

  const { overflow, overflowY } = window.getComputedStyle(element);
  const isScrollable = /(auto|scroll)/.test(overflow + overflowY);

  if (isScrollable && element.scrollHeight > element.clientHeight) {
    return element;
  }

  return findScrollableParent(element.parentElement);
};

function CustomReactFlow (props) {
  return (
      <RF.ReactFlow
      {...props}
      zoomOnScroll={false}
      panOnScroll={false}
      onWheel={(event) => {
        // Prevent ReactFlow from handling the wheel event
        event.preventDefault();
        event.stopPropagation();

        // Find the scrollable parent container
        const scrollContainer = findScrollableParent(event.currentTarget.parentElement);

        // Manually scroll the container based on the wheel delta
        scrollContainer.scrollTop += event.deltaY;

        // Call the original onWheel handler if it exists
        if (props.onWheel) {
          props.onWheel(event);
        }
      }}
    />
  )
}

export default CustomReactFlow;