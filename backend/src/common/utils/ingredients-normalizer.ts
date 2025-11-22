const synonymMap: Record<string, string> = {
  tomatoes: 'tomato',
  tomatoe: 'tomato',
  onions: 'onion',
  garlics: 'garlic',
  potatoes: 'potato',
  chillies: 'chili',
  chilies: 'chili',
  capsicum: 'bell pepper',
  'green capsicum': 'bell pepper',
  'red capsicum': 'bell pepper',
  yoghurt: 'yogurt',
  curd: 'yogurt',
};

function normalizeSingle(raw: string): string | null {
  if (!raw) return null;
  let name = raw.toLowerCase().trim();

  if (name.endsWith('es')) {
    const base = name.slice(0, -2);
    if (synonymMap[name]) {
      name = synonymMap[name];
    } else {
      name = base;
    }
  } else if (name.endsWith('s')) {
    const base = name.slice(0, -1);
    if (synonymMap[name]) {
      name = synonymMap[name];
    } else {
      name = base;
    }
  } else if (synonymMap[name]) {
    name = synonymMap[name];
  }

  // Remove non-word characters at ends (commas, dots, etc.)
  name = name.replace(/^[^a-z0-9]+|[^a-z0-9]+$/gi, '');

  if (!name) return null;
  return name;
}


// (["Tomatoes", "Tomato", "ONION", "onions"]) => (["tomato", "onion"])

export function normalizeIngredients(rawLabels: string[]): string[] {
  const set = new Set<string>();

  for (const label of rawLabels) {
    const norm = normalizeSingle(label);
    if (norm) {
      set.add(norm);
    }
  }

  return Array.from(set);
}