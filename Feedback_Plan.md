# Subject Feedback Implementation Plan (Based on Requirements)

## 1. Requirement Analysis (from Image)

### Mentee View: Subject Feedback Check
- **Core Function:** View feedback summaries and details written by the mentor for each subject.
- **Detailed Requirements:**
    - Feedback is managed by subject flow (Korean/English/Math).
    - Feedback deemed important by the mentor is summarized and emphasized.
    - Click to view detailed feedback content.
    - (Implied) Feedback is tied to a specific date (daily feedback).

### Mentor View: Feedback Writing
- **Core Function:** Efficiently write feedback for each student.
- **Detailed Requirements:**
    - Write feedback categorized by the daily assigned todo items (which are subject-based).
    - Display important content in a "Summary Area".
    - Additional comments or general reviews can be written freely at the bottom.
    - Allow writing/uploading feedback for past dates or specific dates even after the date has passed.

## 2. Database Schema Design (Supabase)

We need a table to store feedback. Since feedback is daily and effective per subject (or general), a structure like this is proposed:

```sql
CREATE TABLE feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mentor_id UUID REFERENCES auth.users(id),
    mentee_id UUID REFERENCES auth.users(id),
    feedback_date DATE NOT NULL,
    
    -- Subject specific feedback (JSONB allows flexibility for subjects like Kor, Eng, Math)
    -- Structure: { "국어": { "summary": "...", "detail": "..." }, "영어": ... }
    subject_feedback JSONB DEFAULT '{}',
    
    -- General daily comment (freestyle at bottom)
    general_comment TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
```

Or, more relational approach (normalized):

```sql
CREATE TABLE feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mentor_id UUID REFERENCES auth.users(id),
    mentee_id UUID REFERENCES auth.users(id),
    feedback_date DATE NOT NULL,
    general_comment TEXT,
    created_at ...
);

CREATE TABLE feedback_details (
    id UUID PRIMARY KEY ...,
    feedback_id UUID REFERENCES feedback(id),
    subject TEXT NOT NULL, -- '국어', '영어', '수학'
    summary TEXT, -- Important summary
    detail TEXT,  -- Full content
    is_important BOOLEAN DEFAULT false
);
```
*Decision:* Normalized approach (2 tables) is better for querying "Important Summaries" easily.

## 3. UI Implementation Plan

### A. Mentee View (Feedback Check)
- **Location:** `MenteeMainView.tsx` (Dashboard) or a new `MenteeFeedbackView.tsx`?
    - The requirement says "Subject Feedback Check" -> likely a section in the daily planner/dashboard.
    - Image mentions "Date selection exposes planner & feedback data".
    - So, in `MenteeMainView` (Dashboard), below the Todo List or in a separate tab/modal.
- **UI Components:**
    - **Summary Cards:** 3 Cards (Kor, Eng, Math) showing the "Summary" text.
    - **Detail Modal:** Clicking a card opens a modal with the full "Detail" text.
    - **Styles:** Emphasize "Important" summaries (bold, distinct background color).

### B. Mentor View (Feedback Writing)
- **Location:** When a mentor selects a mentee -> "Feedback Writing" screen.
- **UI Components:**
    - **Date Picker:** Select date (support past dates).
    - **Todo List Reference:** Show what the mentee did that day (read-only reference).
    - **Input Forms:**
        - Section 1: Subject Feedback (Kor/Eng/Math). Each has "Summary (Important)" input and "Detail" textarea.
        - Section 2: General Comment (Bottom freestyle area).
    - **Save Button:** Saves to DB.

## 4. Proposed Action Items

1.  **Create DB Tables:** Run SQL to create `feedback` and `feedback_details`.
2.  **Create Mock Data:** Insert some sample feedback for the current date.
3.  **Refactor Mentee View:**
    - Add "Today's Feedback" section to `MenteeMainView`.
    - Display Subject Summaries.
    - Implement Click-to-View Detail.
4.  **Create/Refactor Mentor Writing View:** (If requested later, but focus on reading first based on "Refactor Feedback Part" request).

*Implementation Focus for now:* Mentee's "Subject Feedback Check" UI refactoring based on the requirement "View Subject Feedback Summary & Detail".
