// app/api/debug-schema/route.ts
import { connectDB } from '@/lib/db';
import Complaint from '@/models/Complaint';

export async function GET() {
  try {
    await connectDB();
    
    const schemaPaths = Complaint.schema.paths;
    const requiredFields = [];
    const optionalFields = [];
    
    for (const path in schemaPaths) {
      const schemaType = schemaPaths[path];
      if (schemaType.isRequired) {
        requiredFields.push({
          field: path,
          type: schemaType.instance,
          isRequired: schemaType.isRequired
        });
      } else {
        optionalFields.push({
          field: path,
          type: schemaType.instance,
          isRequired: schemaType.isRequired
        });
      }
    }
    
    return Response.json({
      requiredFields,
      optionalFields,
      totalFields: Object.keys(schemaPaths).length
    });
  } catch (error: any) {
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
}