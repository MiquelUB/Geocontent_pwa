
# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** Geocontent_Core
- **Date:** 2026-03-05
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

#### Test TC001 Deep-linking to /profile shows Not Found behavior (known SPA limitation)
- **Test Code:** [TC001_Deep_linking_to_profile_shows_Not_Found_behavior_known_SPA_limitation.py](./TC001_Deep_linking_to_profile_shows_Not_Found_behavior_known_SPA_limitation.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- ASSERTION: '404' text not found on page after navigating to http://localhost:3000/profile.
- ASSERTION: 'Not Found' text not displayed after navigating to http://localhost:3000/profile.
- ASSERTION: Page displays SPA profile content (e.g., 'El Meu Quadern') instead of a 404/Not Found page.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0ea60698-48ab-423a-ac54-63fab8133666/102b43f3-3daa-424a-b1eb-42792b2be2bd
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC002 Unlock admin dashboard with correct master password
- **Test Code:** [TC002_Unlock_admin_dashboard_with_correct_master_password.py](./TC002_Unlock_admin_dashboard_with_correct_master_password.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0ea60698-48ab-423a-ac54-63fab8133666/77dc8ba9-d6d8-450f-80a9-83f46b642e2d
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC003 Deny access with wrong master password
- **Test Code:** [TC003_Deny_access_with_wrong_master_password.py](./TC003_Deny_access_with_wrong_master_password.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0ea60698-48ab-423a-ac54-63fab8133666/de69e790-9ec7-427a-883a-aef53eb6d243
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC004 Deny access when password is empty
- **Test Code:** [TC004_Deny_access_when_password_is_empty.py](./TC004_Deny_access_when_password_is_empty.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0ea60698-48ab-423a-ac54-63fab8133666/68a303d5-c67c-4d53-8931-19d0ee651cb6
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC005 Splash screen transitions to admin gate UI
- **Test Code:** [TC005_Splash_screen_transitions_to_admin_gate_UI.py](./TC005_Splash_screen_transitions_to_admin_gate_UI.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0ea60698-48ab-423a-ac54-63fab8133666/05c3198a-fb75-4a4b-ac9f-4dea1c3959a2
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC006 Press Enter to submit correct password and unlock
- **Test Code:** [TC006_Press_Enter_to_submit_correct_password_and_unlock.py](./TC006_Press_Enter_to_submit_correct_password_and_unlock.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0ea60698-48ab-423a-ac54-63fab8133666/8999e5d7-1eea-44d3-90ae-a6ad7ee9d741
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC007 Remain on gate after wrong password even after retry attempt
- **Test Code:** [TC007_Remain_on_gate_after_wrong_password_even_after_retry_attempt.py](./TC007_Remain_on_gate_after_wrong_password_even_after_retry_attempt.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0ea60698-48ab-423a-ac54-63fab8133666/f07675ac-2b41-4b86-a3e3-d137babd24bf
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC008 View passport progression and unlocked stamps on Profile
- **Test Code:** [TC008_View_passport_progression_and_unlocked_stamps_on_Profile.py](./TC008_View_passport_progression_and_unlocked_stamps_on_Profile.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- No unlocked stamp is visible in the stamps grid; the UI indicates 0 unlocked stamps (expected at least 1).
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0ea60698-48ab-423a-ac54-63fab8133666/5ade47d6-8bf4-4d74-93eb-ff292367a1d3
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC009 Profile remains stable while passport content loads after navigation
- **Test Code:** [TC009_Profile_remains_stable_while_passport_content_loads_after_navigation.py](./TC009_Profile_remains_stable_while_passport_content_loads_after_navigation.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0ea60698-48ab-423a-ac54-63fab8133666/6089ea4d-0d43-418a-a19b-63b76bf3e746
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC010 Retry after a passport fetch failure keeps the user on Profile and shows stamps section
- **Test Code:** [TC010_Retry_after_a_passport_fetch_failure_keeps_the_user_on_Profile_and_shows_stamps_section.py](./TC010_Retry_after_a_passport_fetch_failure_keeps_the_user_on_Profile_and_shows_stamps_section.py)
- **Test Error:** TEST FAILURE

ASSERTIONS:
- Refresh/retry control not found in the passport/stamps section; no clickable element labeled refresh or retry exists in the profile/passport area.
- Unable to verify that clicking refresh/retry does not navigate away because the refresh/retry feature is not present on the page.
- The test could not exercise error-retry behavior; therefore navigation safety under retry could not be validated.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0ea60698-48ab-423a-ac54-63fab8133666/764cd121-3d64-434f-8b4b-4d037679d385
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC011 Catalan labels for gamification sections are visible on Profile
- **Test Code:** [TC011_Catalan_labels_for_gamification_sections_are_visible_on_Profile.py](./TC011_Catalan_labels_for_gamification_sections_are_visible_on_Profile.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0ea60698-48ab-423a-ac54-63fab8133666/c8b810d6-18e7-4be3-9395-50cadb4f5846
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC012 Unlock admin gate and view Executive Report KPIs and charts
- **Test Code:** [TC012_Unlock_admin_gate_and_view_Executive_Report_KPIs_and_charts.py](./TC012_Unlock_admin_gate_and_view_Executive_Report_KPIs_and_charts.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0ea60698-48ab-423a-ac54-63fab8133666/cd74369b-a408-4994-bb75-70bb4be1cbce
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC013 Executive Report tab shows populated state when data loads successfully
- **Test Code:** [TC013_Executive_Report_tab_shows_populated_state_when_data_loads_successfully.py](./TC013_Executive_Report_tab_shows_populated_state_when_data_loads_successfully.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0ea60698-48ab-423a-ac54-63fab8133666/31fad416-7ac7-40e8-abc6-0edf982be4a8
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC014 Executive Report shows a loading state before KPIs and charts appear
- **Test Code:** [TC014_Executive_Report_shows_a_loading_state_before_KPIs_and_charts_appear.py](./TC014_Executive_Report_shows_a_loading_state_before_KPIs_and_charts_appear.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0ea60698-48ab-423a-ac54-63fab8133666/cbee69a8-c356-4ba5-9b18-7cd98b27cf2d
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC015 Executive Report remains accessible after switching tabs and returning
- **Test Code:** [TC015_Executive_Report_remains_accessible_after_switching_tabs_and_returning.py](./TC015_Executive_Report_remains_accessible_after_switching_tabs_and_returning.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0ea60698-48ab-423a-ac54-63fab8133666/90903e69-422d-4e9c-b55a-f042f62a5cbb
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC016 Admin gate submission works via Enter key on password field
- **Test Code:** [TC016_Admin_gate_submission_works_via_Enter_key_on_password_field.py](./TC016_Admin_gate_submission_works_via_Enter_key_on_password_field.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0ea60698-48ab-423a-ac54-63fab8133666/946ad5db-8670-492a-9660-0fdc5f16fa8d
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC017 Unlock admin gate and open IA PDF processing tool
- **Test Code:** [TC017_Unlock_admin_gate_and_open_IA_PDF_processing_tool.py](./TC017_Unlock_admin_gate_and_open_IA_PDF_processing_tool.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0ea60698-48ab-423a-ac54-63fab8133666/44777391-030c-4618-b5ee-f68cb1151a1c
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC018 Process button blocked when no PDF has been selected
- **Test Code:** [TC018_Process_button_blocked_when_no_PDF_has_been_selected.py](./TC018_Process_button_blocked_when_no_PDF_has_been_selected.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0ea60698-48ab-423a-ac54-63fab8133666/31c830ca-2c85-49de-92e4-3b158bc426de
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC019 Admin gate denies access with incorrect master password
- **Test Code:** [TC019_Admin_gate_denies_access_with_incorrect_master_password.py](./TC019_Admin_gate_denies_access_with_incorrect_master_password.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/0ea60698-48ab-423a-ac54-63fab8133666/e6d654ab-39d7-48ed-985b-90b5970305f1
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---


## 3️⃣ Coverage & Matching Metrics

- **84.21** of tests passed

| Requirement        | Total Tests | ✅ Passed | ❌ Failed  |
|--------------------|-------------|-----------|------------|
| ...                | ...         | ...       | ...        |
---


## 4️⃣ Key Gaps / Risks
{AI_GNERATED_KET_GAPS_AND_RISKS}
---