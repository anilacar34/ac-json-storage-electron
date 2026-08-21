#!/usr/bin/env bash
# Turns the frames record-demo.mjs captured into the GIFs in docs/.
#
# Each clip is encoded from its own copy of the frames on purpose: running the
# whole tour through one palettegen and trimming the output writes a full frame
# every time (95 MB against 2 MB), because a palette stretched over every screen
# in the app represents none of them well.
set -euo pipefail
cd "$(dirname "$0")/.."

FRAMES=${FRAMES:-${TMPDIR:-/tmp}/ac-json-storage-demo-frames}
WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT

clip() { # clip <out-name> <from> <count> [width] [fps] [colors]
  local name=$1 from=$2 count=$3 width=${4:-800} fps=${5:-10} colors=${6:-64}
  local d="$WORK/$name"
  mkdir -p "$d"
  local i=0
  while [ "$i" -lt "$count" ]; do
    cp "$FRAMES/$(printf '%05d' $((from + i))).png" "$d/$(printf '%05d' "$i").png"
    i=$((i + 1))
  done
  ffmpeg -y -loglevel error -framerate 10 -i "$d/%05d.png" \
    -filter_complex "[0:v]fps=$fps,scale=$width:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=$colors:stats_mode=diff[p];[b][p]paletteuse=dither=none:diff_mode=rectangle" \
    -loop 0 "docs/$name.gif"
  rm -rf "$d"
  printf '%-22s %s\n' "docs/$name.gif" "$(du -h "docs/$name.gif" | cut -f1)"
}

# Frame ranges come from the marks file the recorder writes next to the frames.
range() { python3 -c "
import json,sys
marks = json.load(open('$FRAMES/marks.json'))['marks']
m = next(x for x in marks if x['label'] == sys.argv[1])
print(m['from'], m['to'] - m['from'])
" "$1"; }

# The tour clip is one span across several steps.
span() { python3 -c "
import json,sys
marks = json.load(open('$FRAMES/marks.json'))['marks']
a = next(x for x in marks if x['label'] == sys.argv[1])
b = next(x for x in marks if x['label'] == sys.argv[2])
print(a['from'], b['to'] - a['from'])
" "$1" "$2"; }

clip tour        $(span zoom export-many)
clip select-tab  $(range select)
clip search      $(range search)
clip import-guard $(range import)
clip delete-all  $(range delete)
clip language    $(range lang)

ffmpeg -y -loglevel error -framerate 10 -start_number 0 -i "$FRAMES/%05d.png" \
  -c:v libx264 -pix_fmt yuv420p -crf 26 -vf "scale=900:-2" -movflags +faststart docs/tour.mp4
printf '%-22s %s\n' docs/tour.mp4 "$(du -h docs/tour.mp4 | cut -f1)"
