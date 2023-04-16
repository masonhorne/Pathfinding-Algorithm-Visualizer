/**
 * Priority Queue Implementation Array Based Binary Heap
 * @author Mason Horne
 */
export class PriorityQueue {
  constructor(comparator = (a, b) => a > b) {
    // Initialize array for storing heap and comparator
    this._heap = [];
    this._comparator = comparator;
    // Initialize index for top of queue and functions for accessing parents and children indices
    this._top = 0;
    this._parent = function (i) {
      return ((i + 1) >> 1) - 1;
    };
    this._left = function (i) {
      return (i << 1) + 1;
    };
    this._right = function (i) {
      return (i + 1) << 1;
    };
  }
  /**
   * Getter for the Priority Queue's size
   * @returns the size of the Priority Queue
   */
  size() {
    return this._heap.length;
  }
  /**
   * Function to check if the queue contains elements
   * @returns true if Priority Queue is empty false otherwise
   */
  isEmpty() {
    return this.size() == 0;
  }
  /**
   * Function to get the next value in the Priority Queue
   * @returns the next value to be removed from the Priority Queue
   */
  peek() {
    return this._heap[this._top];
  }
  /**
   * Function to add an element to the Priority Queue
   * @param {*} value value to add to the Priority Queue
   * @returns the size of the Priority Queue
   */
  push(value) {
    this._heap.push(value);
    this._bubbleUp();
    return this.size();
  }
  /**
   * Function that removes the next element from the Priority Queue and returns it
   * @returns the next element in the Priority Queue
   */
  pop() {
    const removed = this.peek();
    const bottom = this.size() - 1;
    if (bottom > this._top) {
      this._swap(bottom, this._top);
    }
    this._heap.pop();
    this._bubbleDown();
    return removed;
  }
  /** Helper function for comparing elements at index i and j in the Priority Queue with the comparator */
  _greater(i, j) {
    return this._comparator(this._heap[i], this._heap[j]);
  }
  /** Helper function for swapping two elements at index i and j within the Priority Queue's array */
  _swap(i, j) {
    [this._heap[i], this._heap[j]] = [this._heap[j], this._heap[i]];
  }
  /** Helper function to shift newly added elements up to proper index in Priority Queue's array */
  _bubbleUp() {
    let position = this.size() - 1;
    while (
      position > this._top &&
      this._greater(position, this._parent(position))
    ) {
      this._swap(position, this._parent(position));
      position = this._parent(position);
    }
  }
  /** Helper function to shift the top element to its proper position in Priority Queue array after removal */
  _bubbleDown() {
    let position = this._top;
    while (
      (this._left(position) < this.size() &&
        this._greater(this._left(position), position)) ||
      (this._right(position) < this.size() &&
        this._greater(this._right(position), position))
    ) {
      const greaterChild =
        this._right(position) < this.size() &&
        this._greater(this._right(position), this._left(position))
          ? this._right(position)
          : this._left(position);
      this._swap(position, greaterChild);
      position = greaterChild;
    }
  }
}
