/**
 * TreeIntegrity Utility
 * 
 * Provides deterministic guards to prevent DOM tree mutation violations,
 * specifically circular parent-child relationships.
 */

export interface TreeNode {
  id: string;
  parentId: string | null;
  [key: string]: any;
}

/**
 * Checks if a candidate parent is actually a descendant of the target node.
 * Prevents "Cannot moveNode — new parent is already a descendant" errors.
 */
export const isDescendant = (candidateParent: TreeNode, targetNode: TreeNode, allNodes: TreeNode[]): boolean => {
  if (!candidateParent || !targetNode) return false;
  if (candidateParent.id === targetNode.id) return true;

  let current: TreeNode | undefined = candidateParent;
  const visited = new Set<string>();

  while (current && current.parentId) {
    if (visited.has(current.id)) {
      console.warn(`[TreeIntegrity] Circular dependency detected at node ${current.id}`);
      return true; // Cycle detected
    }
    visited.add(current.id);

    if (current.parentId === targetNode.id) {
      return true;
    }
    current = allNodes.find(n => n.id === current?.parentId);
  }

  return false;
};

/**
 * Guarded wrapper for node movement logic.
 */
export const safeMoveNode = (
  nodeId: string, 
  newParentId: string | null, 
  allNodes: TreeNode[],
  onMove: (nodeId: string, newParentId: string | null) => void
) => {
  const node = allNodes.find(n => n.id === nodeId);
  const newParent = newParentId ? allNodes.find(n => n.id === newParentId) : null;

  console.log(`[TreeIntegrity] Attempting to move node ${nodeId} to parent ${newParentId || 'ROOT'}`);

  if (!node) {
    console.error(`[TreeIntegrity] Move failed: Node ${nodeId} not found.`);
    return;
  }

  if (newParent && isDescendant(newParent, node, allNodes)) {
    console.error(`[TreeIntegrity] INVALID MOVE PREVENTED: Target parent ${newParentId} is a descendant of node ${nodeId}.`);
    return;
  }

  // If validation passes, execute the move
  onMove(nodeId, newParentId);
  console.log(`[TreeIntegrity] Move successful: ${nodeId} -> ${newParentId || 'ROOT'}`);
};
