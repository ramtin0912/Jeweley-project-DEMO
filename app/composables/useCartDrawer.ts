/**
 * @file useCartDrawer
 * @description Shared open/close state for the cart drawer.
 *
 * @status None
 * @issues None
 * @todo None
 */
export function useCartDrawer() {
  const isOpen = useState('cart-drawer-open', () => false)

  return {
    isOpen,
    open: () => (isOpen.value = true),
    close: () => (isOpen.value = false),
    toggle: () => (isOpen.value = !isOpen.value)
  }
}
