package portfolio

import (
	"bytes"
	"encoding/json"
	"slices"
	"strings"
)

// normalize turns the rows as loaded into the public view: blank optional text becomes null, lists
// are never null, projects embed the rows they link to, skills are grouped and section items are read
// into entries. It is pure, so the view's rules are unit-tested without a database.
func normalize(p *Portfolio) {
	normalizeProfile(&p.Profile)
	p.Links = orEmpty(p.Links)
	p.Experiences = orEmpty(p.Experiences)
	for i := range p.Experiences {
		normalizeExperience(&p.Experiences[i])
	}
	p.Education = orEmpty(p.Education)
	for i := range p.Education {
		normalizeEducation(&p.Education[i])
	}
	p.Skills = orEmpty(p.Skills)
	for i := range p.Skills {
		p.Skills[i].Category = nullIfBlank(p.Skills[i].Category)
	}
	p.SkillGroups = groupSkills(p.Skills)
	p.Certifications = orEmpty(p.Certifications)
	for i := range p.Certifications {
		p.Certifications[i].CredentialURL = nullIfBlank(p.Certifications[i].CredentialURL)
	}
	p.Projects = orEmpty(p.Projects)
	for i := range p.Projects {
		normalizeProject(&p.Projects[i])
	}
	embedLinks(p.Projects, p.Experiences, p.Education)
	p.Sections = orEmpty(p.Sections)
	for i := range p.Sections {
		p.Sections[i].Entries = sectionEntries(p.Sections[i].Items)
		if len(p.Sections[i].Items) == 0 {
			p.Sections[i].Items = json.RawMessage("[]")
		}
	}
}

func normalizeProfile(profile *Profile) {
	profile.Location = nullIfBlank(profile.Location)
	profile.Email = nullIfBlank(profile.Email)
}

func normalizeExperience(e *Experience) {
	e.EmploymentType = nullIfBlank(e.EmploymentType)
	e.Location = nullIfBlank(e.Location)
	e.Skills = orEmpty(e.Skills)
}

func normalizeEducation(e *Education) {
	e.Degree = nullIfBlank(e.Degree)
	e.Field = nullIfBlank(e.Field)
}

func normalizeProject(p *Project) {
	p.RepoURL = nullIfBlank(p.RepoURL)
	p.DemoURL = nullIfBlank(p.DemoURL)
	p.Skills = orEmpty(p.Skills)
	if p.Experience != nil {
		normalizeExperience(p.Experience)
	}
	if p.Education != nil {
		normalizeEducation(p.Education)
	}
}

// embedLinks gives each project a copy of the published experience or education it links to.
// A link whose row is not in the published lists is cleared, so the id and the object always agree.
func embedLinks(projects []Project, experiences []Experience, education []Education) {
	for i := range projects {
		p := &projects[i]
		p.Experience, p.Education = nil, nil
		if p.ExperienceID != nil {
			if idx := slices.IndexFunc(experiences, func(e Experience) bool { return e.ID == *p.ExperienceID }); idx >= 0 {
				linked := experiences[idx]
				linked.Skills = slices.Clone(linked.Skills)
				p.Experience = &linked
			} else {
				p.ExperienceID = nil
			}
		}
		if p.EducationID != nil {
			if idx := slices.IndexFunc(education, func(e Education) bool { return e.ID == *p.EducationID }); idx >= 0 {
				linked := education[idx]
				p.Education = &linked
			} else {
				p.EducationID = nil
			}
		}
	}
}

// groupSkills groups skills by category (case-insensitive) in the order categories first appear in
// the skill catalog; uncategorized skills, and a category literally named "other", go last under
// OtherSkillsKey.
func groupSkills(skills []Skill) []SkillGroup {
	groups := []SkillGroup{}
	var other *SkillGroup
	for _, skill := range skills {
		key := OtherSkillsKey
		if skill.Category != nil {
			key = strings.ToLower(*skill.Category)
		}
		if key == OtherSkillsKey {
			if other == nil {
				other = &SkillGroup{Key: OtherSkillsKey, Skills: []string{}}
			}
			other.Skills = append(other.Skills, skill.Name)
			continue
		}
		idx := slices.IndexFunc(groups, func(g SkillGroup) bool { return g.Key == key })
		if idx < 0 {
			category := *skill.Category
			groups = append(groups, SkillGroup{Key: key, Category: &category, Skills: []string{}})
			idx = len(groups) - 1
		}
		groups[idx].Skills = append(groups[idx].Skills, skill.Name)
	}
	if other != nil {
		groups = append(groups, *other)
	}
	return groups
}

// Keys that name an item, describe it, or link it. Any other key's value is still shown, after these,
// so no text the owner wrote is dropped.
var (
	entryTitleKeys  = []string{"name", "title", "question", "label", "heading"}
	entryDetailKeys = []string{"note", "answer", "description", "detail", "text", "issuer", "value", "date", "year"}
	entryURLKeys    = []string{"url", "link", "href"}
)

// sectionEntries reads every item that has some text; items with none (null, {}, "") are skipped.
func sectionEntries(raw json.RawMessage) []SectionEntry {
	entries := []SectionEntry{}
	var items []any
	if err := decodeJSON(raw, &items); err != nil {
		return entries
	}
	for _, item := range items {
		if entry, ok := readEntry(item); ok {
			entries = append(entries, entry)
		}
	}
	return entries
}

func readEntry(item any) (SectionEntry, bool) {
	record, isRecord := item.(map[string]any)
	if !isRecord {
		title := textOf(item)
		return SectionEntry{Title: title}, title != ""
	}

	titles := pickTexts(record, entryTitleKeys)
	details := pickTexts(record, entryDetailKeys)
	others := otherTexts(record)
	parts := slices.Concat(details, others)
	if len(titles) > 0 {
		parts = slices.Concat(titles, details, others)
	}
	if len(parts) == 0 {
		return SectionEntry{}, false
	}
	entry := SectionEntry{Title: parts[0], URL: entryURL(record)}
	if rest := strings.Join(parts[1:], ", "); rest != "" {
		entry.Detail = &rest
	}
	return entry, true
}

func pickTexts(record map[string]any, keys []string) []string {
	texts := []string{}
	for _, key := range keys {
		if text := textOf(record[key]); text != "" {
			texts = append(texts, text)
		}
	}
	return texts
}

// otherTexts returns the values of keys outside the known lists, in key order (JSONB does not keep
// the order keys were written in).
func otherTexts(record map[string]any) []string {
	known := slices.Concat(entryTitleKeys, entryDetailKeys, entryURLKeys)
	keys := []string{}
	for key := range record {
		if !slices.Contains(known, key) {
			keys = append(keys, key)
		}
	}
	slices.Sort(keys)
	return pickTexts(record, keys)
}

// entryURL returns the first http(s) link; other schemes are dropped so a section can never carry a
// javascript: URL into a page.
func entryURL(record map[string]any) *string {
	for _, key := range entryURLKeys {
		url := textOf(record[key])
		lower := strings.ToLower(url)
		if strings.HasPrefix(lower, "https://") || strings.HasPrefix(lower, "http://") {
			return &url
		}
	}
	return nil
}

// textOf flattens a JSON value to display text: strings trimmed, numbers as written, lists and nested
// objects joined with ", ". Booleans and null have no text.
func textOf(value any) string {
	switch v := value.(type) {
	case string:
		return strings.TrimSpace(v)
	case json.Number:
		return v.String()
	case []any:
		texts := []string{}
		for _, element := range v {
			if text := textOf(element); text != "" {
				texts = append(texts, text)
			}
		}
		return strings.Join(texts, ", ")
	case map[string]any:
		keys := make([]string, 0, len(v))
		for key := range v {
			keys = append(keys, key)
		}
		slices.Sort(keys)
		return strings.Join(pickTexts(v, keys), ", ")
	default:
		return ""
	}
}

// decodeJSON keeps numbers as written (1.50 stays "1.50").
func decodeJSON(raw json.RawMessage, dst any) error {
	decoder := json.NewDecoder(bytes.NewReader(raw))
	decoder.UseNumber()
	return decoder.Decode(dst)
}

func nullIfBlank(value *string) *string {
	if value == nil {
		return nil
	}
	trimmed := strings.TrimSpace(*value)
	if trimmed == "" {
		return nil
	}
	return &trimmed
}

func orEmpty[T any](items []T) []T {
	if items == nil {
		return []T{}
	}
	return items
}
