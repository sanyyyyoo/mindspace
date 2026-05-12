const { data, error } = await supabase
  .from("journal_entries")
  .insert({
    journal,
    productivity_score: aiResult.productivityScore,
    summary: aiResult.summary,
    feedback: aiResult.feedback,
    categories: aiResult.categories,
    sleep_hours: aiResult.sleepHours,
    study_hours: aiResult.studyHours,
    activity: aiResult.activity
  })
  .select();

console.log("SUPABASE INSERT DATA:", data);
console.log("SUPABASE INSERT ERROR:", error);
