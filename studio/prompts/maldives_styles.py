"""Maldives Expo posters in the user's four reference styles (I002-I005).
Images carry only the headline; logos and event details are typeset afterwards in code.

  python3 studio/prompts/maldives_styles.py   -> saves nodes I002..I005 in studio/jimeng-state.json
"""
import json, subprocess

S = "studio/jimeng-state.json"
N = {k: v["nodeId"] for k, v in json.load(open(S))["nodes"].items()}
DREAM = ("the CoolFly Dream personal eVTOL, matching {{node:%s}} and {{node:%s}} exactly: open black tubular roll cage, "
         "single white seat, orange nose fairing with two white racing stripes, four straight carbon arms, each with a coaxial "
         "pair of black two-blade propellers (upper and lower), green motor lights" % (N["R_dream"], N["R_dream3"]))
TOP = ("seen exactly from directly above like {{node:%s}}: long narrow orange body with two white stripes along the nose, "
       "white seat, black roll cage, four carbon arms in an X with spinning propeller discs" % N["R_dtop"])
END = " Absolutely no other text, no logos, no watermarks. Photoreal, high detail."

P = {
 "I002": ("Maldives poster 1 · 航拍路面大字", "R_s1",
  "Portrait poster. Recreate the composition, camera and photographic look of {{node:%s}}: straight-down aerial drone photo of a street "
  "crossing with giant white road-paint letters filling the frame. Setting: Hulhumale, Maldives: sun-bleached concrete waterfront "
  "boulevard crossing; top-left and bottom-left corners show flat rooftops of modern white apartment blocks with palms; the right "
  "edge is turquoise lagoon water behind a sea wall. Giant worn white road-paint letters on the asphalt: line 1 WHERE WILL, line 2 YOU, "
  "line 3 enormous FLY spelled F-L-Y, the L clearly showing its full horizontal foot. All letters fully visible and unobstructed. "
  "The three lines of text occupy only the top 55%% of the frame. "
  "In the lower part, at about 70%% of the frame height, well below and clear of the letters, hovering low over empty asphalt: %s, %s. "
  "Its rotor downwash blows a circular swirl of sand on the road around it and two faint sand trails run up toward the letters behind "
  "it like tyre marks. The bottom 15%% of the frame is plain empty road. Harsh tropical midday sun, crisp shadows." + END),
 "I003": ("Maldives poster 2 · 俯拍海面", "R_s2",
  "Portrait poster. Recreate the layout, colours and graphic style of {{node:%s}}: straight-down view of clear turquoise sea with "
  "sparkling texture, chunky rounded bold display type at the top. Headline in two lines: LET'S in white plus GO in aqua blue on line 1, "
  "fly in big sand-beige lowercase on line 2. Directly below the headline, centred, %s, %s, hovering low over the water; its rotor "
  "downwash pushes concentric ripple rings and a fine spray mist outward on the sea surface. Left and right edges: pale white sandbank "
  "shallows and coral heads seen through the water, a few small reef fish shadows. The lower 30%% of the frame is open turquoise water "
  "with nothing on it." + END),
 "I004": ("Maldives poster 3 · 海上远去", "R_s3",
  "Portrait poster. Recreate the composition, colours and photographic look of {{node:%s}}: deep blue Indian Ocean under a bright blue "
  "sky with a radiant sun at top centre and white cumulus clouds on the horizon; a huge cream condensed sans headline SOAR in the upper "
  "third. Instead of the boat: %s, seen from behind and slightly above, flying fast and low toward the horizon in the centre of the "
  "frame, a pilot in black flight suit and helmet seated. Its rotor downwash tears two long white spray trails across the water behind "
  "it, exactly like a speedboat wake. Far on the horizon, tiny Maldives islands with palms. Bottom 20%% darker deep blue water with no "
  "objects." + END),
 "I005": ("Maldives poster 4 · 黑白栈桥", "R_s4",
  "Portrait poster. Recreate the layout, black-and-white photographic look and typography of {{node:%s}}. Black-and-white photo of a "
  "long straight wooden overwater jetty in the Maldives in one-point perspective running to the horizon, thatched overwater villas on "
  "stilts along both sides, coconut palms. Top: giant heavy black condensed sans letters SKY, with tall palm fronds and cumulus "
  "clouds overlapping and hiding the lower part of the letters. Middle: the word TO in the same black font, smaller. Painted in huge "
  "perspective letters along the jetty planks, foreshortened like road text: MALDIVES. Hovering above the jetty in the middle distance, "
  "%s, the only object in colour (orange body); everything else monochrome. Leave the left and right middle areas and the bottom 15%% "
  "free of text." + END),
}

for key, (title, ref, prompt) in P.items():
    dream = (DREAM, TOP) if key in ("I002", "I003") else (DREAM,)
    text = prompt % ((N[ref],) + dream)
    refs = ["--ref", ref, "--ref", "R_dream", "--ref", "R_dream3"] + (["--ref", "R_dtop"] if key in ("I002", "I003") else [])
    print(key, len(text))
    subprocess.run(["python3", "tools/jm.py", S, "img", key, "--title", title, "--ratio", "3:4", "--prompt", text] + refs, check=True)
