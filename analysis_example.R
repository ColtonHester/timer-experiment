# Focus Timer Experiment - Data Analysis Example
# DATASCI 241 - Fall 2025 - Group 4

# Load required packages
library(tidyverse)
library(lme4)        # For mixed effects models
library(lmerTest)    # For p-values in mixed models
library(ggplot2)
library(knitr)

# Set working directory to where your CSV files are
# setwd("path/to/your/data")

# ============================================================================
# 1. LOAD AND PREPARE DATA
# ============================================================================

# Load data from admin export
sessions <- read_csv("sessions.csv")
baseline <- read_csv("baseline_surveys.csv")
ratings <- read_csv("post_session_ratings.csv")
post_treatment <- read_csv("post_treatment_surveys.csv")

# Convert duration from seconds to minutes
sessions <- sessions %>%
  mutate(
    duration_minutes = actual_duration_seconds / 60,
    condition = factor(condition, levels = c("COUNTDOWN", "HOURGLASS"))
  )

# Merge with baseline data
full_data <- sessions %>%
  left_join(baseline, by = "participant_id") %>%
  left_join(ratings, by = "session_id")

# ============================================================================
# 2. DESCRIPTIVE STATISTICS
# ============================================================================

# Overall summary
summary_stats <- full_data %>%
  group_by(condition) %>%
  summarise(
    n_sessions = n(),
    mean_duration = mean(duration_minutes, na.rm = TRUE),
    sd_duration = sd(duration_minutes, na.rm = TRUE),
    median_duration = median(duration_minutes, na.rm = TRUE),
    min_duration = min(duration_minutes, na.rm = TRUE),
    max_duration = max(duration_minutes, na.rm = TRUE),
    completion_rate = mean(completed_full_session, na.rm = TRUE)
  )

print("Summary Statistics by Condition:")
print(summary_stats)

# ============================================================================
# 3. PRIMARY HYPOTHESIS TEST
# H0: No difference in mean duration between countdown and hourglass
# H1: Hourglass leads to different sustained focus duration
# ============================================================================

# Calculate mean duration per participant per condition
participant_means <- full_data %>%
  group_by(participant_id, condition) %>%
  summarise(mean_duration = mean(duration_minutes, na.rm = TRUE), .groups = "drop")

# Pivot to wide format for paired t-test
wide_data <- participant_means %>%
  pivot_wider(names_from = condition, values_from = mean_duration)

# Paired t-test
t_test_result <- t.test(
  wide_data$HOURGLASS,
  wide_data$COUNTDOWN,
  paired = TRUE,
  alternative = "two.sided"
)

print("Paired t-test Results:")
print(t_test_result)

# Calculate effect size (Cohen's d for paired samples)
diff <- wide_data$HOURGLASS - wide_data$COUNTDOWN
cohens_d <- mean(diff, na.rm = TRUE) / sd(diff, na.rm = TRUE)
print(paste("Cohen's d:", round(cohens_d, 3)))

# ============================================================================
# 4. VISUALIZATIONS
# ============================================================================

# Box plot of duration by condition
p1 <- ggplot(full_data, aes(x = condition, y = duration_minutes, fill = condition)) +
  geom_boxplot(alpha = 0.7) +
  geom_jitter(width = 0.2, alpha = 0.3) +
  labs(
    title = "Session Duration by Timer Condition",
    x = "Timer Type",
    y = "Duration (minutes)",
    caption = "Each dot represents one session"
  ) +
  theme_minimal() +
  scale_fill_manual(values = c("COUNTDOWN" = "#3b82f6", "HOURGLASS" = "#f59e0b"))

ggsave("duration_by_condition.png", p1, width = 8, height = 6)

# Individual trajectories (spaghetti plot)
p2 <- ggplot(full_data, aes(x = session_number, y = duration_minutes,
                             group = participant_id, color = condition)) +
  geom_line(alpha = 0.3) +
  geom_smooth(aes(group = condition), method = "loess", se = TRUE, size = 1.5) +
  labs(
    title = "Session Duration Over Time",
    x = "Session Number",
    y = "Duration (minutes)",
    color = "Condition"
  ) +
  theme_minimal() +
  scale_color_manual(values = c("COUNTDOWN" = "#3b82f6", "HOURGLASS" = "#f59e0b"))

ggsave("duration_over_time.png", p2, width = 10, height = 6)

# Histogram of differences
p3 <- ggplot(wide_data, aes(x = HOURGLASS - COUNTDOWN)) +
  geom_histogram(bins = 20, fill = "#8b5cf6", alpha = 0.7) +
  geom_vline(xintercept = 0, linetype = "dashed", color = "red", size = 1) +
  labs(
    title = "Distribution of Within-Subject Differences",
    x = "Hourglass Duration - Countdown Duration (minutes)",
    y = "Count",
    caption = "Positive values = Hourglass lasted longer"
  ) +
  theme_minimal()

ggsave("difference_distribution.png", p3, width = 8, height = 6)

# ============================================================================
# 5. SECONDARY ANALYSES
# ============================================================================

# 5A. Perceived Stress by Condition
stress_comparison <- full_data %>%
  group_by(condition) %>%
  summarise(
    mean_stress = mean(perceived_stress, na.rm = TRUE),
    sd_stress = sd(perceived_stress, na.rm = TRUE)
  )

print("Perceived Stress by Condition:")
print(stress_comparison)

# Test for stress difference
stress_wide <- full_data %>%
  group_by(participant_id, condition) %>%
  summarise(mean_stress = mean(perceived_stress, na.rm = TRUE), .groups = "drop") %>%
  pivot_wider(names_from = condition, values_from = mean_stress)

t_test_stress <- t.test(stress_wide$HOURGLASS, stress_wide$COUNTDOWN, paired = TRUE)
print("Stress Comparison t-test:")
print(t_test_stress)

# 5B. Completion Rate by Condition
completion_comparison <- full_data %>%
  group_by(condition) %>%
  summarise(completion_rate = mean(completed_full_session, na.rm = TRUE))

print("Completion Rate by Condition:")
print(completion_comparison)

# Chi-square test for completion rate
completion_table <- table(full_data$condition, full_data$completed_full_session)
chi_sq_result <- chisq.test(completion_table)
print("Completion Rate Chi-square Test:")
print(chi_sq_result)

# ============================================================================
# 6. MODERATOR ANALYSIS: TIME ANXIETY
# ============================================================================

# Split participants by median time anxiety
median_anxiety <- median(baseline$time_anxiety_score, na.rm = TRUE)

full_data <- full_data %>%
  mutate(high_anxiety = time_anxiety_score >= median_anxiety)

# Calculate treatment effect by anxiety level
moderator_analysis <- full_data %>%
  group_by(participant_id, high_anxiety, condition) %>%
  summarise(mean_duration = mean(duration_minutes, na.rm = TRUE), .groups = "drop") %>%
  pivot_wider(names_from = condition, values_from = mean_duration) %>%
  mutate(treatment_effect = HOURGLASS - COUNTDOWN)

# Test if treatment effect differs by anxiety level
anxiety_test <- t.test(
  treatment_effect ~ high_anxiety,
  data = moderator_analysis,
  var.equal = FALSE
)

print("Moderator Analysis: Time Anxiety")
print(anxiety_test)

# Visualize moderator effect
p4 <- ggplot(moderator_analysis, aes(x = high_anxiety, y = treatment_effect,
                                     fill = high_anxiety)) +
  geom_boxplot(alpha = 0.7) +
  geom_jitter(width = 0.2, alpha = 0.5) +
  geom_hline(yintercept = 0, linetype = "dashed", color = "red") +
  labs(
    title = "Treatment Effect by Baseline Time Anxiety",
    x = "High Time Anxiety",
    y = "Treatment Effect (minutes)\nHourglass - Countdown",
    caption = "Positive = Hourglass increased duration"
  ) +
  theme_minimal() +
  scale_fill_manual(values = c("FALSE" = "#10b981", "TRUE" = "#ef4444"))

ggsave("moderator_anxiety.png", p4, width = 8, height = 6)

# ============================================================================
# 7. MIXED EFFECTS MODEL (Advanced)
# ============================================================================

# Account for repeated measures within participants
mixed_model <- lmer(
  duration_minutes ~ condition + session_number + time_anxiety_score +
    (1 | participant_id),
  data = full_data
)

print("Mixed Effects Model Summary:")
print(summary(mixed_model))

# Extract fixed effects
fixed_effects <- fixef(mixed_model)
print("Fixed Effects:")
print(fixed_effects)

# ============================================================================
# 8. ORDER EFFECTS CHECK
# ============================================================================

# Test if session number affects duration
order_model <- lm(duration_minutes ~ session_number * condition, data = full_data)
print("Order Effects Model:")
print(summary(order_model))

# Visualize order effects
p5 <- ggplot(full_data, aes(x = session_number, y = duration_minutes,
                            color = condition, group = condition)) +
  stat_summary(fun = mean, geom = "line", size = 1.5) +
  stat_summary(fun = mean, geom = "point", size = 3) +
  stat_summary(fun.data = mean_se, geom = "errorbar", width = 0.2) +
  labs(
    title = "Mean Duration by Session Number",
    x = "Session Number",
    y = "Mean Duration (minutes)",
    color = "Condition"
  ) +
  theme_minimal() +
  scale_color_manual(values = c("COUNTDOWN" = "#3b82f6", "HOURGLASS" = "#f59e0b"))

ggsave("order_effects.png", p5, width = 10, height = 6)

# ============================================================================
# 9. QUALITATIVE ANALYSIS: TIMER PREFERENCE
# ============================================================================

# Summarize timer preferences
preference_summary <- post_treatment %>%
  count(preferred_timer) %>%
  mutate(percentage = n / sum(n) * 100)

print("Timer Preference Summary:")
print(preference_summary)

# Visualize preferences
p6 <- ggplot(preference_summary, aes(x = preferred_timer, y = percentage,
                                     fill = preferred_timer)) +
  geom_bar(stat = "identity", alpha = 0.8) +
  geom_text(aes(label = paste0(round(percentage, 1), "%")),
            vjust = -0.5, size = 5) +
  labs(
    title = "Post-Treatment Timer Preference",
    x = "Preferred Timer",
    y = "Percentage of Participants (%)"
  ) +
  theme_minimal() +
  scale_fill_manual(values = c(
    "COUNTDOWN" = "#3b82f6",
    "HOURGLASS" = "#f59e0b",
    "NO_PREFERENCE" = "#6b7280"
  ))

ggsave("timer_preference.png", p6, width = 8, height = 6)

# ============================================================================
# 10. EXPORT RESULTS TABLE FOR PAPER
# ============================================================================

results_table <- data.frame(
  Measure = c(
    "Mean Duration - Countdown (min)",
    "Mean Duration - Hourglass (min)",
    "Mean Difference (min)",
    "t-statistic",
    "p-value",
    "Cohen's d",
    "95% CI Lower",
    "95% CI Upper"
  ),
  Value = c(
    round(mean(wide_data$COUNTDOWN, na.rm = TRUE), 2),
    round(mean(wide_data$HOURGLASS, na.rm = TRUE), 2),
    round(mean(diff, na.rm = TRUE), 2),
    round(t_test_result$statistic, 3),
    format.pval(t_test_result$p.value, digits = 3),
    round(cohens_d, 3),
    round(t_test_result$conf.int[1], 2),
    round(t_test_result$conf.int[2], 2)
  )
)

print("Results Table for Paper:")
print(results_table)

write_csv(results_table, "results_table.csv")

# ============================================================================
# END OF ANALYSIS
# ============================================================================

print("Analysis complete! Check your working directory for generated plots and tables.")
