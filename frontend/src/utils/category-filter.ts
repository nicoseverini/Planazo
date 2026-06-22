/**
 * Returns true if the item's categories satisfy the selection using AND semantics.
 * An empty selection means "Any" — all items pass through.
 *
 * Examples with selectedCategories = ['HIKING', 'NATURE']:
 *   ['HIKING', 'NATURE', 'ADVENTURE'] → true  (has all selected)
 *   ['HIKING', 'NATURE']              → true
 *   ['HIKING', 'ADVENTURE']           → false  (missing NATURE)
 *   ['NATURE']                        → false  (missing HIKING)
 */
export function matchesCategories(
    itemCategories: string[],
    selectedCategories: string[],
): boolean {
    if (selectedCategories.length === 0) return true;
    return selectedCategories.every((cat) => itemCategories.includes(cat));
}
