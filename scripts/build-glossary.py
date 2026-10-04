#!/usr/bin/env python3
"""Seed public/data/glossary.json from current flashcards (names, places, concepts)."""

from __future__ import annotations

import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CARDS = ROOT / "public" / "flashcards"
OUT = ROOT / "public" / "data" / "glossary.json"

CITE = re.compile(r"\([^()\n]*\d+\s*:\s*\d+[^()\n]*,\s*NTV\)", re.I)
TOKEN = re.compile(
    r"\b[A-ZÁÉÍÓÚÜÑ][A-Za-zÁÉÍÓÚÜÑáéíóúüñ]*(?:-[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*\b"
)

SKIP = {
    "A", "D", "E", "II", "J", "S", "Sí", "Su", "Tan", "So", "Ven", "Mal",
    "Antes", "Aunque", "Contra", "Cuando", "Cuál", "Cuáles", "Cuántas",
    "Cuánto", "Cuántos", "Cómo", "Desde", "Después", "Durante", "Dónde",
    "Entre", "Hasta", "Las", "Los", "Por", "Porque", "Quién", "Qué",
    "Según", "Sobre", "Solo", "También", "Una", "Unas", "Unos",
    "Llevador", "Truenos",
    "Casa", "Hijo", "Rey", "Reyes", "Padre", "Jefe", "Juez", "Gente", "Tribu",
    "Dios", "Señor", "DIOS", "Altísimo",
    "Índice", "Total", "Llamado", "Sam", "Samu", "Asd", "Ben", "Amó", "Davi",
    "Dav", "Sen", "Absal", "Joa", "Mesa", "Todo", "Toda", "Todas", "Uno",
    "Todos", "Tierra", "Fuego", "Valle", "Gran", "Guerra", "Ciudad", "Espíritu",
    "Pacto", "Mar", "Sal", "Oro", "Amor", "Madera", "Comida", "Culpa", "Muerte",
    "Plaga", "Piedras", "Palacio", "Oficiales", "Ofrenda", "Esposas", "Altares",
    "Altos", "Caballos", "Carpinteros", "Calabazas", "Cedros", "Censo",
    "Construcción", "Conspiración", "Dedicación", "División", "Enfermedad",
    "Encargos", "Hambre", "Mayordomo", "Milagros", "Muerte", "Rebelión",
    "Reforma", "Riquezas", "Sabiduría", "Traición", "Víveres", "Victorias",
    "Valientes", "Bosque", "Cueva", "Cántico", "Juicio", "Perdón", "Voto",
    "Rojo", "Ella", "Él", "Tú", "Bajo", "Ante", "Delante", "Alegres",
    "Aproximadamente", "Acusar", "Caer", "Confesar", "Cumplir", "Dejar",
    "Desnudo", "Entregar", "Enviar", "Fingirse", "Instruirlos", "Mira",
    "Obedecer", "Orar", "Pasar", "Poner", "Reunir", "Traer", "Transferir",
    "Aun", "Como", "Cada", "Sus", "Más", "Era", "Eran", "Estaba", "Estaban",
    "Había", "Tenía", "Que", "Con", "Para", "Tras", "Hacia", "Junto",
    "Mientras", "Además", "Quiénes", "Adónde", "Cuándo",
    "Tres", "Siete", "Veinte", "Dos", "Doce", "Veintidós", "Setenta", "Cinco",
    "Treinta", "Trescientos", "Veinticinco", "Mil", "Dieciséis", "Nueve",
    "Ocho", "Ochenta", "Seis", "Diez", "Ciento", "Cuarenta", "Catorce", "Cien",
    "Cincuenta", "Cuatro", "Cuatrocientos", "Diecisiete", "Noventa", "Once",
    "Ochocientos", "Quince", "Seiscientos", "Sesenta", "Setecientas", "Trece",
    "Veintiocho", "Veintiún",
    "Hizo", "Llegó", "Dejó", "Hubo", "Quitó", "Salió", "Buscaron", "Sospechó",
    "Caída", "Defendería", "Anduvo", "Ofreció", "Clamaron", "Habla", "Huyeron",
    "Volvió", "Ordenó", "Echó", "Entró", "Lloró", "Ofrecía", "Rasgó",
    "Clavarlo", "Extendió", "Abrió", "Avisaron", "Ayunó", "Añoraba", "Bendijo",
    "Caer", "Cayó", "Clamó", "Codiciaban", "Comenzaron", "Construirle",
    "Convocó", "Crecía", "Cubrió", "Cuidando", "Derramó", "Derribó",
    "Destruirlos", "Devolverle", "Devolverlo", "Dormía", "Envió", "Escucharía",
    "Esperaba", "Golpeó", "Gritaron", "Habitaban", "Herirla", "Huyó", "Lloraba",
    "Lloraron", "Luchó", "Mató", "Mojó", "Movía", "Murieron", "Murió",
    "Pagaba", "Perdió", "Perseguirlo", "Persiguió", "Prefirió", "Presentó",
    "Pusieron", "Puso", "Rascaba", "Recogiendo", "Resentido", "Sacarles",
    "Sacrificaba", "Sacrificó", "Seducían", "Servía", "Subieron", "Tembló",
    "Temieron", "Temía", "Temían", "Tomaban", "Tomó", "Tronó", "Tuvieron",
    "Venció", "Viva", "Vino",
    "Samuel",  # book + prophet; keep as person below by forcing include
}

# Re-include the prophet despite SKIP of common words
FORCE_PERSON = {"Samuel"}

PLACES = {
    "Israel", "Judá", "Jerusalén", "Samaria", "Asiria", "Egipto", "Betel",
    "Bet-el", "Silo", "Mizpa", "Hebrón", "Jabes", "Jezreel", "Gat", "Galaad",
    "Nob", "Jordán", "Babilonia", "Ramá", "Carmelo", "Damasco", "Asdod",
    "Gabaón", "Moab", "Jericó", "Beerseba", "Gabaa", "Ecrón", "Quiriat-jearim",
    "Adulam", "Tiro", "Tecoa", "Horeb", "Ramot", "Bet-semes", "Bezec", "Gilgal",
    "Guilgal", "Bahurim", "Gihón", "Gezer", "Tirsa", "Ribla", "Belén", "Líbano",
    "Edom", "Meguido", "Sidón", "Dan", "Micmas", "Geba", "Ézel", "En-rogel",
    "Pas-damim", "Galilea", "Tarsis", "Sarepta", "Dotán", "Tifsa", "Afec",
    "Zoba", "Araba", "Arabá", "Hamat", "Efraín", "Milo", "Cedrón", "Querit",
    "Beerot", "Abel-bet-maaca", "Anatot", "Ava", "Baal-hazor", "Baal-perazim",
    "Bet-rehob", "Boscat", "Cabul", "Cisón", "Cuta", "Elat", "Eción-geber",
    "Ezión-geber", "Gebal", "Gesur", "Gozán", "Guibeá", "Habor", "Halah",
    "Hazor", "Heret", "Ibleam", "Kir", "Laquis", "Libna", "Mahanaim", "Naiot",
    "Neftalí", "Nínive", "Ofir", "Sefarvaim", "Sela", "Sila", "Siquem",
    "Sucot", "Tabor", "Tob", "Zaretán", "Zereda", "Zohélet", "Éufrates",
    "Eben-ezer", "Ebenezer", "Jabés", "Jabes-galaad", "Ramot-galaad",
    "Sabá", "Siria", "Amón", "Benjamín", "Isacar", "Rubén", "Leví",
    "Aram", "Horeb", "Rimón", "Baala", "Etanim",
}

GODS = {
    "Baal", "Dagón", "Asera", "Astoret", "Quemós", "Moloc", "Milcom",
    "Nergal", "Nisroc", "Baal-zebub", "Anamelec", "Asima", "Adramelec",
    "Sucot-benot", "Tartac", "Nibhaz", "Nehustán",
}

CONCEPTS = [
    ("arca", ["arca del pacto", "arca de Dios"], "concepto"),
    ("filisteos", ["filisteo", "filistea", "filisteas"], "persona"),
    ("israelitas", ["israelita"], "persona"),
    ("amalequitas", ["Amalec", "amalecita"], "persona"),
    ("gabaonitas", ["gabaonita"], "persona"),
    ("tumores", [], "concepto"),
    ("efod", [], "concepto"),
    ("lugares altos", [], "concepto"),
    ("becerro", ["becerros"], "concepto"),
    ("Urim", ["Tumim", "urim y tumim"], "concepto"),
    ("querubines", ["querubín"], "concepto"),
    ("tabernáculo", [], "concepto"),
    ("templo", [], "concepto"),
    ("pacto", [], "concepto"),
    ("mar de bronce", ["mar de Bronce"], "concepto"),
    ("reina de Sabá", [], "persona"),
    ("holocausto", ["holocaustos"], "concepto"),
    ("levitas", ["levita"], "persona"),
    ("ungido", ["unción", "ungió"], "concepto"),
    ("carreta", ["carreta nueva"], "concepto"),
    ("ratones", ["ratones de oro"], "concepto"),
]

ALIASES = {
    "Ichabod": ["Icabod"],
    "Ebenezer": ["Eben-ezer"],
    "Betel": ["Bet-el"],
    "Arabá": ["Araba"],
    "Gilgal": ["Guilgal"],
    "Sadoc": ["Zadok"],
    "Elá": ["Ela"],
    "Jabes": ["Jabés"],
}

# Tokens too generic or truncated even if capitalized
SKIP |= FORCE_PERSON  # handled separately


def parse_card(raw: str) -> tuple[str, str]:
    lines = raw.replace("\r\n", "\n").split("\n")
    q = a = ""
    phase = "meta"
    for line in lines:
        t = line.strip()
        if t == "#flashcard":
            continue
        if t == "?":
            phase = "answer"
            continue
        if phase == "meta":
            if t.startswith("#"):
                q = re.sub(r"^#+\s*", "", t).strip()
                phase = "question"
            continue
        if phase == "question":
            if t == "---" or t.startswith("[["):
                break
            if t and t != "?":
                q = f"{q} {t}".strip()
            continue
        if phase == "answer":
            if t == "---":
                continue
            if t.startswith("[["):
                break
            if t:
                a = f"{a}\n{t}".strip() if a else t
    return q, a


def slug(term: str) -> str:
    n = unicodedata.normalize("NFD", term)
    n = "".join(c for c in n if unicodedata.category(c) != "Mn")
    n = n.lower()
    n = re.sub(r"[^a-z0-9]+", "-", n).strip("-")
    return n or "termino"


def kind_for(term: str) -> str:
    if term in GODS or term in {c[0] for c in CONCEPTS}:
        return "concepto" if term in GODS or any(c[0] == term for c in CONCEPTS) else "persona"
    if term in GODS:
        return "concepto"
    if term in PLACES:
        return "lugar"
    if "-" in term and term.split("-")[0] in {
        "Bet", "Baal", "En", "Pas", "Quiriat", "Abel", "Ezión", "Pérez",
        "Tiglat", "Esar", "Evil", "Berodac", "Hadad", "Is", "Ben", "Obed",
        "Josheb", "Sucot",
    }:
        if term.split("-")[0] in {"Baal"} and term not in {"Baal-zebub"}:
            return "lugar"
        if term in GODS:
            return "concepto"
        if term.startswith(("Bet", "En", "Pas", "Quiriat", "Abel", "Ezión", "Pérez")):
            return "lugar"
        if term.startswith(("Tiglat", "Esar", "Evil", "Berodac", "Hadad", "Is", "Ben", "Obed", "Josheb")):
            return "persona"
    if term in GODS:
        return "concepto"
    return "persona"


def main() -> None:
    files = [
        p
        for p in CARDS.rglob("*.md")
        if p.name not in {"index.md", "manifest.json"}
    ]
    blob_parts = []
    for p in files:
        q, a = parse_card(p.read_text(encoding="utf-8"))
        blob_parts.append(CITE.sub(" ", f"{q} {a}"))
    blob = "\n".join(blob_parts)

    counts: dict[str, int] = {}
    for m in TOKEN.findall(blob):
        counts[m] = counts.get(m, 0) + 1

    terms: dict[str, dict] = {}

    def add(term: str, kind: str, aliases: list[str] | None = None) -> None:
        term = term.strip()
        if not term:
            return
        key = slug(term)
        aliases = [x for x in (aliases or []) if x and x.casefold() != term.casefold()]
        if key in terms:
            existing = terms[key]
            for al in aliases:
                if al not in existing["aliases"] and al.casefold() != existing["term"].casefold():
                    existing["aliases"].append(al)
            return
        terms[key] = {
            "id": key,
            "term": term,
            "aliases": aliases,
            "kind": kind,
            "note": "",
        }

    for term, n in counts.items():
        if term in SKIP and term not in FORCE_PERSON:
            continue
        if len(term) < 3:
            continue
        if term[0].islower():
            continue
        # skip likely Spanish verbs remaining
        if term.endswith(("ó", "ía")) and term not in {"Elías", "Josías", "Ocozías", "Azarías", "Zacarías", "Seraías", "Ahías", "Abías", "Miqueas", "Semaías", "Asaías", "Netanías", "Matanías", "Hulda"}:
            if term not in {"Elías"}:
                # still allow names ending in ías
                if not term.endswith("ías") and not term.endswith("íá"):
                    continue
        add(term, kind_for(term), ALIASES.get(term, []))

    for term in FORCE_PERSON:
        if counts.get(term, 0):
            add(term, "persona")

    for term in GODS:
        if re.search(rf"(?<![A-Za-zÁÉÍÓÚÜÑáéíóúüñ]){re.escape(term)}(?![A-Za-zÁÉÍÓÚÜÑáéíóúüñ])", blob, re.I):
            add(term, "concepto")

    for term, aliases, kind in CONCEPTS:
        if re.search(rf"(?<![A-Za-zÁÉÍÓÚÜÑáéíóúüñ]){re.escape(term)}(?![A-Za-zÁÉÍÓÚÜÑáéíóúüñ])", blob, re.I):
            add(term, kind, aliases)

    # Drop entries that never match the corpus (safety)
    keep = []
    for e in terms.values():
        forms = [e["term"], *e["aliases"]]
        ok = False
        for f in forms:
            if re.search(
                rf"(?<![A-Za-zÁÉÍÓÚÜÑáéíóúüñ]){re.escape(f)}(?![A-Za-zÁÉÍÓÚÜÑáéíóúüñ])",
                blob,
                re.I if len(f) >= 4 else 0,
            ):
                ok = True
                break
        if ok:
            keep.append(e)

    by_fold: dict[str, dict] = {}
    for e in keep:
        by_fold[e["term"].casefold()] = e
    merged: list[dict] = []
    absorbed: set[str] = set()
    for e in keep:
        if e["id"] in absorbed:
            continue
        extra = []
        for al in list(e["aliases"]):
            other = by_fold.get(al.casefold())
            if other and other["id"] != e["id"]:
                extra.append(other["term"])
                extra.extend(other["aliases"])
                absorbed.add(other["id"])
        for al in extra:
            if al.casefold() != e["term"].casefold() and al not in e["aliases"]:
                e["aliases"].append(al)
        merged.append(e)
    keep = [e for e in merged if e["id"] not in absorbed]

    # Prefer canonical spellings
    for e in keep:
        if e["term"] == "Bet-el":
            e["term"] = "Betel"
            if "Bet-el" not in e["aliases"]:
                e["aliases"].insert(0, "Bet-el")
            e["id"] = "betel"
        if e["term"] == "Icabod":
            e["term"] = "Ichabod"
            if "Icabod" not in e["aliases"]:
                e["aliases"].insert(0, "Icabod")
            e["id"] = "ichabod"
        if e["term"] == "Guilgal":
            e["term"] = "Gilgal"
            if "Guilgal" not in e["aliases"]:
                e["aliases"].insert(0, "Guilgal")
            e["id"] = "gilgal"
        if e["term"] == "Zadok":
            e["term"] = "Sadoc"
            if "Zadok" not in e["aliases"]:
                e["aliases"].insert(0, "Zadok")
            e["id"] = "sadoc"
        if e["term"] == "Ela":
            e["term"] = "Elá"
            if "Ela" not in e["aliases"]:
                e["aliases"].insert(0, "Ela")
            e["id"] = "ela"
        if e["id"] == "gadi":
            e["kind"] = "persona"
        if e["id"] == "ratones":
            e["term"] = "ratones"
            e["kind"] = "concepto"

    keep.sort(key=lambda e: e["term"].casefold())
    # unique ids already
    OUT.parent.mkdir(parents=True, exist_ok=True)
    payload = {"entries": keep}
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(keep)} glossary entries from {len(files)} cards -> {OUT}")


if __name__ == "__main__":
    main()
