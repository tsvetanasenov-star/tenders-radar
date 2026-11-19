import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  // Проверка на API ключ
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey || apiKey !== process.env.INGEST_API_KEY) {
    return NextResponse.json({ error: "Неautorизиран достъп" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      external_ref_id,
      source_url,
      title,
      contracting_authority,
      region,
      estimated_value_bgn,
      submission_deadline,
      raw_extracted_text,
      content_hash,
    } = body;

    if (!external_ref_id || !source_url || !title || !contracting_authority) {
      return NextResponse.json(
        { error: "Липсват задължителни полета" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Upsert по external_ref_id
    const { data, error } = await supabase
      .from("tenders")
      .upsert(
        {
          external_ref_id,
          source_url,
          title,
          contracting_authority,
          region: region || null,
          estimated_value_bgn: estimated_value_bgn || null,
          submission_deadline: submission_deadline || null,
          raw_extracted_text: raw_extracted_text || null,
          content_hash: content_hash || null,
        },
        { onConflict: "external_ref_id" }
      )
      .select();

    if (error) throw error;

    const isNew = data?.[0]?.scraped_at === new Date().toISOString();

    return NextResponse.json({
      status: isNew ? "created" : "updated",
      tender: data?.[0],
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Вътрешна грешка" },
      { status: 500 }
    );
  }
}