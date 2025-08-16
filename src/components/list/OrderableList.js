import React from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

/**
 * A list that allows its children to be reordered by dragging and dropping.
 *
 * @example
 * ```jsx
 * <OrderableList
 *    id="items"
 *    onMoved={({sourceIndex, destinationIndex}) =>
 *      swap(items, sourceIndex, destinationIndex)}
 * >
 *   {items.map((item) => (
 *      <li>{item}</li>
 *   ))}
 * </OrderableList>
 * ```
 *
 * @param {object} props
 * @param {React.ReactElement[]} props.children
 * @param {string} props.id
 */
export const OrderableList = ({ id, children, onMoved, onDragStart }) => {
  const handleDragEnd = (result) => {
    if (!result.destination) {
      return;
    }
    onMoved({
      sourceIndex: result.source.index,
      destinationIndex: result.destination.index,
    });
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd} onBeforeDragStart={onDragStart}>
      <Droppable droppableId={`droppable-${id}`}>
        {(provided, _snapshot) => (
          <ol {...provided.droppableProps} ref={provided.innerRef}>
            {/* We clone the children and add the drag handlers props */}
            {React.Children.map(children, (child, index) => {
              if (React.isValidElement(child)) {
                return (
                  <Draggable
                    key={child.key}
                    draggableId={child.key}
                    index={index}
                  >
                    {(provided, snapshot) => {
                      // Block horizontal movement
                      const style = provided.draggableProps.style;
                      if (style.transform) {
                        style.transform = style.transform.replace(/\d+/, "0");
                      }

                      return React.cloneElement(child, {
                        // Add a dragging attribute for styling
                        ...(snapshot.isDragging && !snapshot.isDropAnimating
                          ? { dragging: "" }
                          : {}),
                        ref: provided.innerRef,
                        ...provided.draggableProps,
                        ...provided.dragHandleProps,
                      });
                    }}
                  </Draggable>
                );
              } else {
                return child;
              }
            })}
            {provided.placeholder}
          </ol>
        )}
      </Droppable>
    </DragDropContext>
  );
};
