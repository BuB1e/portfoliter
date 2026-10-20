package admin

// themeCatalog lists the site designs set_theme accepts. The first entry is the default.
// Keys and their order must match THEME_KEYS in portfoliter-rr-v8/app/lib/theme.ts;
// TestThemeCatalogMatchesFrontend fails when they differ.
var themeCatalog = []Theme{
	{Key: "dating", Name: "Dating app", Description: "Dark dating-profile look; projects are a swipeable card deck."},
	{Key: "field-guide", Name: "Field guide", Description: "Light naturalist field guide; projects are pinned specimens."},
	{Key: "parcel", Name: "Parcel", Description: "Kraft-paper shipping box with a shipping label, bubble wrap and stickers."},
}
