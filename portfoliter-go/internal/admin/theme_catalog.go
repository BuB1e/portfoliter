package admin

// themeCatalog lists the site designs set_theme accepts. The first entry is the default.
// Keys and their order must match THEME_KEYS in portfoliter-rr-v8/app/lib/theme.ts;
// TestThemeCatalogMatchesFrontend fails when they differ.
// "plain" comes first so a fresh clone renders the neutral page until the owner picks a design.
var themeCatalog = []Theme{
	{Key: "plain", Name: "Plain", Description: "Neutral single-column page in the system font; every field, no decoration. The default."},
	{Key: "dating", Name: "Dating app", Description: "Dark dating-profile look; projects are a swipeable card deck."},
	{Key: "field-guide", Name: "Field guide", Description: "Light naturalist field guide; projects are pinned specimens."},
	{Key: "parcel", Name: "Parcel", Description: "Kraft-paper shipping box with a shipping label, bubble wrap and stickers."},
	{Key: "spec-sheet", Name: "Spec sheet", Description: "Serious and minimal: white page, one sans-serif, label-and-content rows, deep blue accent."},
	{Key: "skytrain", Name: "Skytrain", Description: "Career drawn as a Bangkok BTS line map; jobs are stations, projects are interchanges."},
	{Key: "status-page", Name: "Status page", Description: "Uptime status page; skills are components, past jobs are resolved incidents."},
	{Key: "receipt", Name: "Receipt", Description: "Thermal mini-mart receipt in monospace; jobs are purchases, projects are line items, ends with a barcode."},
	{Key: "broadsheet", Name: "Broadsheet", Description: "Newspaper front page with a blackletter masthead; projects are articles, jobs are appointments, skills are classifieds."},
	{Key: "quest-log", Name: "Quest log", Description: "RPG character sheet in blue pixel menu windows; skills are stats, jobs are quests, projects open as quest scrolls."},
	{Key: "retro-desktop", Name: "Retro desktop", Description: "1990s desktop on teal with bevelled grey windows and a taskbar; projects are files that open in their own window."},
}
