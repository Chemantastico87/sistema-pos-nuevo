import os
import json
import re

def audit_i18n():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    locales_dir = os.path.join(base_dir, "frontend", "src", "locales")
    
    languages = ["es", "en", "pt"]
    translations = {lang: {} for lang in languages}
    
    # Cargar todos los archivos de traducción
    for lang in languages:
        lang_dir = os.path.join(locales_dir, lang)
        if not os.path.exists(lang_dir):
            print(f"Directorio de idioma no encontrado: {lang_dir}")
            continue
            
        for fname in os.listdir(lang_dir):
            if fname.endswith(".json"):
                ns = fname.replace(".json", "")
                filepath = os.path.join(lang_dir, fname)
                try:
                    with open(filepath, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        for key, val in data.items():
                            full_key = f"{ns}.{key}"
                            translations[lang][full_key] = val
                            translations[lang][key] = val # También sin namespace
                except Exception as e:
                    print(f"Error leyendo {filepath}: {e}")

    es_keys = set([k for k in translations["es"].keys() if "." in k])
    en_keys = set([k for k in translations["en"].keys() if "." in k])
    pt_keys = set([k for k in translations["pt"].keys() if "." in k])
    
    all_keys = es_keys.union(en_keys).union(pt_keys)
    total_keys_count = len(all_keys)
    
    es_coverage = (len(es_keys) / total_keys_count * 100) if total_keys_count > 0 else 100
    en_coverage = (len(en_keys) / total_keys_count * 100) if total_keys_count > 0 else 100
    pt_coverage = (len(pt_keys) / total_keys_count * 100) if total_keys_count > 0 else 100
    
    missing_en = es_keys - en_keys
    missing_pt = es_keys - pt_keys
    
    report = {
        "total_namespaces": 18,
        "total_translation_keys": total_keys_count,
        "coverage": {
            "es": f"{es_coverage:.1f}%",
            "en": f"{en_coverage:.1f}%",
            "pt": f"{pt_coverage:.1f}%"
        },
        "missing_keys": {
            "en": list(missing_en),
            "pt": list(missing_pt)
        },
        "status": "PASSED" if (es_coverage == 100 and en_coverage == 100 and pt_coverage == 100) else "COMPLETED_WITH_WARNINGS"
    }
    
    print("\n=========================================================")
    print("VENDIX POS - INFORME DE AUDITORÍA Y COBERTURA i18n")
    print("=========================================================")
    print(f"Total de Claves de Traducción Estandarizadas: {total_keys_count}")
    print(f"Cobertura Español (es): {report['coverage']['es']} ({len(es_keys)} / {total_keys_count})")
    print(f"Cobertura Inglés (en): {report['coverage']['en']} ({len(en_keys)} / {total_keys_count})")
    print(f"Cobertura Portugués (pt): {report['coverage']['pt']} ({len(pt_keys)} / {total_keys_count})")
    print("---------------------------------------------------------")
    print(f"Estado Final Auditoría: {report['status']}")
    print("=========================================================\n")
    
    return report

if __name__ == "__main__":
    audit_i18n()
