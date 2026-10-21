"""Maldives brand posters (I006 Edge style, I007 Spain style). Headlines in-image; small copy typeset in code.

  python3 studio/prompts/maldives_brand.py [KEY ...]
"""
import json, subprocess, sys

S = "studio/jimeng-state.json"
N = {k: v["nodeId"] for k, v in json.load(open(S))["nodes"].items()}
DREAM = ("the CoolFly Dream personal eVTOL, matching {{node:%s}} and {{node:%s}} exactly: open black tubular roll cage, "
         "single white seat, orange nose fairing with two white racing stripes, four straight carbon arms, each with a coaxial "
         "pair of black two-blade propellers, green motor lights" % (N["R_dream"], N["R_dream3"]))
END = " Absolutely no other text, no logos, no watermarks. Photoreal, high detail."

P = {
 "I006": ("Maldives 品牌海报 A · THE EDGE 风格", ["R_s5", "R_dream", "R_dream3", "R_dtop"],
  "Portrait editorial poster. Recreate the layout, paper texture, colours and typography of {{node:%s}} exactly. Warm cream "
  "uncoated paper background with subtle grain and soft vignette. Huge tall condensed bold sans headline in orange (#FF6A1A) across "
  "the top third, two lines: FIRST / FLIGHT. Lower 55%% of the page: a large rectangular photo panel of deep turquoise Maldives "
  "lagoon water seen straight down, with soft light ripples. Seen exactly from directly above like {{node:%s}}: %s, with a pilot "
  "in a black flight suit and white helmet seated, centred horizontally. Orientation matters: the nose fairing with the two white "
  "stripes points UP toward the headline and the pilot faces UP toward that nose (his knees and hands toward the top of the frame, "
  "the seat back and headrest behind him toward the bottom); the tail fairing at the bottom is plain orange without stripes; its body extends beyond the top edge of the water panel "
  "onto the paper and its orange nose overlaps the bottom of the headline letters, exactly like the canoe in the reference. Its "
  "four spinning rotors push circular ripple rings on the water. Between the headline and the water panel leave a plain cream "
  "band with no text. Leave a thin plain cream strip at the very top and a plain cream strip at the bottom with no text." % (
      N["R_s5"], N["R_dtop"], DREAM) + END),
 "I007": ("Maldives 品牌海报 B · SPAIN 风格", ["R_s6", "R_dream", "R_dream3"],
  "Portrait travel poster. Recreate the layout and look of {{node:%s}} exactly. Top 12%%: plain warm off-white paper with no "
  "text. Below it a giant heavy geometric sans word MALDIVES spanning the full width, in off-white, where the photo shows through "
  "parts of the letters exactly like the reference, the letters cut out of the sky. The photo: golden-hour aerial view of the "
  "Maldives: a turquoise lagoon dotted with small palm islands with white sand rings, a row of thatched overwater villas on "
  "stilts in the foreground on the left, a white seaplane moored on the right. Flying low across the lagoon between two "
  "islands, mid frame and large enough to read clearly, %s, pilot in black flight suit and helmet aboard, banking gently, "
  "rotor downwash spraying a thin mist on the water. Warm, sunny, saturated summer colours, Kodak film look. Bottom 10%% of "
  "the frame is calm water with nothing on it." % (N["R_s6"], DREAM) + END),
}

# I010: I006 regenerated with explicit coaxial rotor geometry (I006 showed three blades per motor)
P["I010"] = (P["I006"][0].replace("A ·", "A2 ·"), P["I006"][1], P["I006"][2].replace(
    " Absolutely no other text",
    " ROTORS: each of the four motors carries TWO separate two-blade propellers stacked coaxially (one above, one below), "
    "so from directly above every motor shows exactly FOUR blades crossing in an X, all four equal in length and evenly "
    "spaced at 90 degrees, never three. Absolutely no other text"))

# I011-I014: four more tries at I010, also pinning the stripes to the nose only
for i, k in enumerate(["I011", "I012", "I013", "I014"], 2):
    P[k] = (P["I010"][0].replace("A2 ·", f"A{i + 1} ·"), P["I010"][1], P["I010"][2].replace(
        " Absolutely no other text",
        " Stripes on the nose only; the rear fairing is plain orange. Absolutely no other text").replace(
        "ROTORS: each of the four motors carries TWO separate two-blade propellers stacked coaxially (one above, one below), "
        "so from directly above every motor shows exactly FOUR blades crossing in an X, all four equal in length and evenly "
        "spaced at 90 degrees, never three.",
        "ROTORS: each motor has two coaxial two-blade props, so from above every motor shows exactly FOUR equal blades in an X "
        "at 90 degrees, never three."))

for key in (sys.argv[1:] or P):
    title, refs, text = P[key]
    print(key, len(text))
    args = ["python3", "tools/jm.py", S, "img", key, "--title", title, "--ratio", "3:4", "--prompt", text]
    for r in refs:
        args += ["--ref", r]
    subprocess.run(args, check=True)
