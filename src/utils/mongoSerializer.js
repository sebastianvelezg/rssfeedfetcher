// src/lib/utils/mongoSerializer.js
export function serializeMongoDoc(doc) {
  if (!doc) return null;

  const plainDoc = { ...doc };

  if (plainDoc._id) {
    plainDoc._id = plainDoc._id.toString();
  }

  for (const [key, value] of Object.entries(plainDoc)) {
    if (value instanceof Date) {
      plainDoc[key] = value.toISOString();
    }
  }

  return plainDoc;
}

export function serializeMongoDocArray(docs) {
  return docs.map((doc) => serializeMongoDoc(doc));
}
