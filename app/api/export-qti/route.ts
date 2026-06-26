import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

function escapeXML(unsafe: string) {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const testId = url.searchParams.get('testId');

  if (!testId) {
    return NextResponse.json({ error: 'Missing testId' }, { status: 400 });
  }

  try {
    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: { questions: true }
    });

    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    // Generate a basic QTI 2.1 AssessmentItem for each question (simplified structure)
    // We'll return a single XML file representing an imsmanifest/assessment object for simplicity, 
    // though real QTI is a zip with multiple files.
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<questestinterop xmlns="http://www.imsglobal.org/xsd/ims_qtiasiv1p2">
  <assessment ident="${test.id}" title="${escapeXML(test.title)}">
    <section ident="SECTION_1">
`;

    test.questions.forEach((q, idx) => {
      xml += `      <item ident="${q.id}" title="Question ${idx + 1}">
        <presentation>
          <material>
            <mattext texttype="text/plain">${escapeXML(q.questionText)}</mattext>
          </material>
`;
      if (q.type === 'mcq' && q.options) {
        const options = JSON.parse(q.options) as string[];
        xml += `          <response_lid ident="RESPONSE_1" rcardinality="Single">
            <render_choice>
`;
        options.forEach((opt, optIdx) => {
          xml += `              <response_label ident="OPT_${optIdx}">
                <material>
                  <mattext texttype="text/plain">${escapeXML(opt)}</mattext>
                </material>
              </response_label>
`;
        });
        xml += `            </render_choice>
          </response_lid>
`;
      }
      xml += `        </presentation>
      </item>
`;
    });

    xml += `    </section>
  </assessment>
</questestinterop>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Content-Disposition': `attachment; filename="${test.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_qti.xml"`
      }
    });
  } catch (error) {
    console.error('Error generating QTI:', error);
    return NextResponse.json({ error: 'Failed to generate QTI' }, { status: 500 });
  }
}
