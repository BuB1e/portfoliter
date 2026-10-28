package portfolio

import (
	"encoding/json"
	"reflect"
	"testing"
)

func ptr[T any](v T) *T { return &v }

func TestGroupSkillsKeepsCatalogOrderAndPutsOtherLast(t *testing.T) {
	skills := []Skill{
		{Name: "Go", Category: nil},
		{Name: "TypeScript", Category: ptr("Language")},
		{Name: "PostgreSQL", Category: ptr("database")},
		{Name: "Rust", Category: ptr("language")},
		{Name: "Figma", Category: ptr("Other")},
		{Name: "nginx", Category: nil},
	}

	got := groupSkills(skills)

	want := []SkillGroup{
		{Key: "language", Category: ptr("Language"), Skills: []string{"TypeScript", "Rust"}},
		{Key: "database", Category: ptr("database"), Skills: []string{"PostgreSQL"}},
		{Key: OtherSkillsKey, Category: nil, Skills: []string{"Go", "Figma", "nginx"}},
	}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("groupSkills = %+v, want %+v", got, want)
	}
}

func TestGroupSkillsEmptyIsEmptyList(t *testing.T) {
	got, _ := json.Marshal(groupSkills(nil))

	if string(got) != "[]" {
		t.Fatalf("groupSkills(nil) JSON = %s, want []", got)
	}
}

func TestSectionEntriesReadsEveryShape(t *testing.T) {
	raw := json.RawMessage(`[
		"Thai",
		42,
		{"label": "English", "level": "Professional"},
		{"question": "Favourite bug?", "answer": "Off by one"},
		{"name": "Hackathon finalist", "note": "Lisbon, 2025", "url": "https://example.com/hack"},
		{"name": "Bad link", "url": "javascript:alert(1)"},
		{"event": "PyCon Lisbon", "role": "Speaker"},
		{"name": "Typed SQL", "tags": ["talk", "keynote"], "year": 2024, "draft": false},
		{"score": 1.50},
		{},
		"",
		null,
		true
	]`)

	got := sectionEntries(raw)

	want := []SectionEntry{
		{Title: "Thai"},
		{Title: "42"},
		{Title: "English", Detail: ptr("Professional")},
		{Title: "Favourite bug?", Detail: ptr("Off by one")},
		{Title: "Hackathon finalist", Detail: ptr("Lisbon, 2025"), URL: ptr("https://example.com/hack")},
		{Title: "Bad link"},
		{Title: "PyCon Lisbon", Detail: ptr("Speaker")},
		{Title: "Typed SQL", Detail: ptr("2024, talk, keynote")},
		{Title: "1.50"},
	}
	if !reflect.DeepEqual(got, want) {
		gotJSON, _ := json.Marshal(got)
		wantJSON, _ := json.Marshal(want)
		t.Fatalf("sectionEntries =\n%s\nwant\n%s", gotJSON, wantJSON)
	}
}

func TestSectionEntriesBadJSONIsEmpty(t *testing.T) {
	for _, raw := range []string{``, `{}`, `"text"`, `[1,`} {
		if got := sectionEntries(json.RawMessage(raw)); len(got) != 0 || got == nil {
			t.Errorf("sectionEntries(%q) = %#v, want empty non-nil list", raw, got)
		}
	}
}

func TestEmbedLinksCopiesPublishedRowsAndClearsMissingOnes(t *testing.T) {
	experiences := []Experience{{ID: 1, Company: "Lumen", Skills: []string{"Go"}}}
	education := []Education{{ID: 7, Institution: "Porto Polytechnic"}}
	projects := []Project{
		{ID: 1, ProjectType: "WORK", ExperienceID: ptr(int64(1))},
		{ID: 2, ProjectType: "UNIVERSITY", EducationID: ptr(int64(7))},
		{ID: 3, ProjectType: "WORK", ExperienceID: ptr(int64(99))},
		{ID: 4, ProjectType: "PERSONAL"},
	}

	embedLinks(projects, experiences, education)

	if projects[0].Experience == nil || projects[0].Experience.Company != "Lumen" {
		t.Errorf("project 1 experience = %+v, want Lumen", projects[0].Experience)
	}
	projects[0].Experience.Skills[0] = "changed"
	if experiences[0].Skills[0] != "Go" {
		t.Error("embedded experience shares its skills slice with the experiences list")
	}
	if projects[1].Education == nil || projects[1].Education.Institution != "Porto Polytechnic" {
		t.Errorf("project 2 education = %+v, want Porto Polytechnic", projects[1].Education)
	}
	if projects[2].ExperienceID != nil || projects[2].Experience != nil {
		t.Errorf("project 3 links an unpublished experience: id=%v experience=%+v", projects[2].ExperienceID, projects[2].Experience)
	}
	if projects[3].Experience != nil || projects[3].Education != nil {
		t.Errorf("project 4 has links: %+v", projects[3])
	}
}

func TestNormalizeBlanksBecomeNullAndListsAreNeverNull(t *testing.T) {
	p := Portfolio{
		Profile:     Profile{FullName: "Mira", Location: ptr("  "), Email: ptr(" mira@example.com ")},
		Experiences: []Experience{{ID: 1, EmploymentType: ptr(""), Location: ptr("Porto")}},
		Education:   []Education{{ID: 1, Degree: ptr(""), Field: ptr("Design")}},
		Skills:      []Skill{{Name: "Go", Category: ptr(" ")}},
		Projects:    []Project{{ID: 1, RepoURL: ptr(""), DemoURL: ptr("https://demo.example")}},
		Certifications: []Certification{
			{ID: 1, Name: "Cert", CredentialURL: ptr("")},
		},
		Sections: []Section{{Key: "talks", Title: "Talks"}},
	}

	normalize(&p)

	if p.Profile.Location != nil || p.Profile.Email == nil || *p.Profile.Email != "mira@example.com" {
		t.Errorf("profile = %+v", p.Profile)
	}
	if p.Experiences[0].EmploymentType != nil || p.Experiences[0].Skills == nil {
		t.Errorf("experience = %+v", p.Experiences[0])
	}
	if p.Education[0].Degree != nil || *p.Education[0].Field != "Design" {
		t.Errorf("education = %+v", p.Education[0])
	}
	if p.Skills[0].Category != nil || len(p.SkillGroups) != 1 || p.SkillGroups[0].Key != OtherSkillsKey {
		t.Errorf("skills = %+v, groups = %+v", p.Skills, p.SkillGroups)
	}
	if p.Projects[0].RepoURL != nil || p.Projects[0].Skills == nil {
		t.Errorf("project = %+v", p.Projects[0])
	}
	if p.Certifications[0].CredentialURL != nil {
		t.Errorf("certification = %+v", p.Certifications[0])
	}
	if string(p.Sections[0].Items) != "[]" || p.Sections[0].Entries == nil {
		t.Errorf("section = %+v", p.Sections[0])
	}
	body, _ := json.Marshal(p)
	var decoded map[string]any
	_ = json.Unmarshal(body, &decoded)
	for _, list := range []string{"links", "experiences", "projects", "skills", "skillGroups", "education", "certifications", "sections"} {
		if _, ok := decoded[list].([]any); !ok {
			t.Errorf("%s = %v, want a JSON list", list, decoded[list])
		}
	}
}
