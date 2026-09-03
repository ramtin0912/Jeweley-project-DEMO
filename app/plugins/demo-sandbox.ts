/**
 * @file demo-sandbox
 * @description Loads the baked catalog and applies the visitor's per-browser sandbox.
 *
 * On SSR/prerender this fetches the baked `/api/*` snapshot into `useState` (so every
 * page's default data is correct and carried in the payload). On the client it then
 * applies any saved localStorage sandbox, so a visitor who played with the admin sees
 * their edits everywhere (storefront + admin) in their own browser. Edits never leave
 * the browser and never affect other visitors.
 */
export default defineNuxtPlugin(async () => {
  const shop = useShopData()
  await shop.loadBaked()
  shop.applySandbox()
})
