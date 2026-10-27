package admin

import (
	"context"
	"errors"
	"fmt"
	"unicode/utf8"

	"github.com/jackc/pgx/v5"
)

// SummaryMaxChars is the longest summary (the card's short description) a write may set.
// Summaries saved before the limit existed may be longer; re-sending them unchanged is allowed,
// so live data never has to be truncated.
const SummaryMaxChars = 200

const (
	projectTypeWork       = "WORK"
	projectTypePersonal   = "PERSONAL"
	projectTypeUniversity = "UNIVERSITY"
)

// validateProject checks the rules that need no database: type and which link fits it.
func validateProject(in ProjectInput) error {
	switch in.ProjectType {
	case projectTypeWork, projectTypePersonal, projectTypeUniversity:
	default:
		return fmt.Errorf("projectType must be WORK, PERSONAL or UNIVERSITY")
	}
	if in.ExperienceID != nil && in.ProjectType != projectTypeWork {
		return fmt.Errorf("experienceId is only allowed when projectType is WORK")
	}
	if in.EducationID != nil && in.ProjectType != projectTypeUniversity {
		return fmt.Errorf("educationId is only allowed when projectType is UNIVERSITY")
	}
	return nil
}

func summaryTooLong(summary string) bool {
	return utf8.RuneCountInString(summary) > SummaryMaxChars
}

// checkSummary rejects a summary over the limit unless it is the project's current, unchanged summary.
func (s *Store) checkSummary(ctx context.Context, id int64, summary string) error {
	if !summaryTooLong(summary) {
		return nil
	}
	tooLong := fmt.Errorf("summary is %d characters; the card short description allows at most %d. "+
		"Put the longer text in content (markdown)", utf8.RuneCountInString(summary), SummaryMaxChars)
	if id == 0 {
		return tooLong
	}
	var current string
	err := s.pool.QueryRow(ctx, `SELECT summary FROM portfoliter.projects WHERE id = $1`, id).Scan(&current)
	if errors.Is(err, pgx.ErrNoRows) {
		return tooLong
	}
	if err != nil {
		return fmt.Errorf("read current summary: %w", err)
	}
	if current != summary {
		return tooLong
	}
	return nil
}
