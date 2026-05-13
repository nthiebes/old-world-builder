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
// X offset (in px) applied to the dragged element when the drop will land
// inside a folder. Visual cue that the item is about to be filed.
const INTO_FOLDER_OFFSET_PX = 24;

export const OrderableList = ({
  id,
  children,
  onMoved,
  onBeforeCapture,
  onDragStart,
  onDragUpdate,
  onDragEnd,
  intoFolder,
}) => {
  const handleDragEnd = (result) => {
    // Always fire a cleanup callback so callers can reset transient drag
    // state even when the drop is cancelled (no destination).
    onDragEnd?.(result);
    if (!result.destination) {
      return;
    }
    onMoved({
      sourceIndex: result.source.index,
      destinationIndex: result.destination.index,
    });
  };

  return (
    <DragDropContext
      onBeforeCapture={onBeforeCapture}
      onBeforeDragStart={onDragStart}
      onDragUpdate={onDragUpdate}
      onDragEnd={handleDragEnd}
    >
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
                    isDragDisabled={!!child.props?.dragDisabled}
                  >
                    {(provided, snapshot) => {
                      // Clone style — rbd's object is frozen.
                      const style = provided.draggableProps.style
                        ? { ...provided.draggableProps.style }
                        : provided.draggableProps.style;
                      if (style?.transform) {
                        // rbd transforms look like `translate(Xpx, Ypx)`.
                        // Block horizontal motion, then optionally indent
                        // when landing in a folder.
                        const shiftX =
                          snapshot.isDragging && intoFolder
                            ? INTO_FOLDER_OFFSET_PX
                            : 0;
                        style.transform = style.transform.replace(
                          /translate\(\s*-?\d+px/,
                          `translate(${shiftX}px`,
                        );
                      }

                      return React.cloneElement(child, {
                        // Add a dragging attribute for styling
                        ...(snapshot.isDragging && !snapshot.isDropAnimating
                          ? { dragging: "" }
                          : {}),
                        ref: provided.innerRef,
                        ...provided.draggableProps,
                        style,
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
