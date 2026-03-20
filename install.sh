#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SHELL_DIR="$SCRIPT_DIR/shell"
CONTAINER=""
OUTPUT_DIR="$SCRIPT_DIR/dist"
CONTROL_UI="/usr/local/lib/node_modules/openclaw/dist/control-ui"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

info()  { echo -e "${CYAN}[INFO]${NC} $*"; }
ok()    { echo -e "${GREEN}[OK]${NC}   $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $*"; }
die()   { echo -e "${RED}[ERR]${NC}  $*" >&2; exit 1; }

usage() {
  cat <<'EOF'
OpenClaw Command Center overlay builder

Usage:
  ./install.sh [options]

Options:
  -c, --container NAME    OpenClaw container name. Auto-detected when omitted.
  -o, --output DIR        Output directory. Default: ./dist
  -h, --help              Show this help message.

Examples:
  ./install.sh
  ./install.sh -c openclaw -o /path/to/openclaw/custom-ui
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    -c|--container)
      [[ $# -ge 2 ]] || die "Missing value for $1"
      CONTAINER="$2"
      shift 2
      ;;
    -o|--output)
      [[ $# -ge 2 ]] || die "Missing value for $1"
      OUTPUT_DIR="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      die "Unknown argument: $1"
      ;;
  esac
done

command -v docker >/dev/null 2>&1 || die "docker was not found. Install Docker first."
[[ -d "$SHELL_DIR" ]] || die "Shell template directory not found: $SHELL_DIR"

if [[ -z "$CONTAINER" ]]; then
  info "Detecting a running OpenClaw container..."
  CONTAINER=$(docker ps --format '{{.Names}}' | while read -r name; do
    if docker exec "$name" sh -c "test -d $CONTROL_UI" >/dev/null 2>&1; then
      echo "$name"
      break
    fi
  done)
  [[ -n "$CONTAINER" ]] || die "No running OpenClaw container was detected. Use -c to specify one."
  ok "Detected container: $CONTAINER"
fi

docker exec "$CONTAINER" sh -c "test -d $CONTROL_UI" >/dev/null 2>&1 \
  || die "Container '$CONTAINER' does not contain $CONTROL_UI"

OC_VERSION=$(docker exec "$CONTAINER" sh -c \
  "node -e \"console.log(require('/usr/local/lib/node_modules/openclaw/package.json').version)\"" 2>/dev/null \
  || echo "unknown")
info "OpenClaw version: $OC_VERSION"

info "Extracting upstream control UI from the container..."
rm -rf "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR"
docker cp "$CONTAINER:$CONTROL_UI/." "$OUTPUT_DIR/"
ok "Copied upstream UI to $OUTPUT_DIR"

ASSETS_DIR="$OUTPUT_DIR/assets"
[[ -d "$ASSETS_DIR" ]] || die "Extracted UI is missing assets/: $ASSETS_DIR"

detect_file() {
  local pattern=$1
  local description=$2
  local found=''
  found=$(find "$ASSETS_DIR" -maxdepth 1 -type f -name "$pattern" | head -n 1)
  [[ -n "$found" ]] || die "Could not find $description matching $pattern"
  basename "$found"
}

OPENCLAW_INDEX_JS=$(detect_file 'index-*.js' 'index JS')
OPENCLAW_LIT_JS=$(detect_file 'lit-*.js' 'Lit runtime JS')
OPENCLAW_FORMAT_JS=$(detect_file 'format-*.js' 'format runtime JS')
OPENCLAW_INDEX_CSS=$(detect_file 'index-*.css' 'index CSS')

ok "index JS:  $OPENCLAW_INDEX_JS"
ok "lit JS:    $OPENCLAW_LIT_JS"
ok "format JS: $OPENCLAW_FORMAT_JS"
ok "index CSS: $OPENCLAW_INDEX_CSS"

info "Rendering index.html and mission-control-overview.html..."
sed \
  -e "s|{{OPENCLAW_INDEX_JS}}|$OPENCLAW_INDEX_JS|g" \
  -e "s|{{OPENCLAW_LIT_JS}}|$OPENCLAW_LIT_JS|g" \
  -e "s|{{OPENCLAW_FORMAT_JS}}|$OPENCLAW_FORMAT_JS|g" \
  -e "s|{{OPENCLAW_INDEX_CSS}}|$OPENCLAW_INDEX_CSS|g" \
  "$SHELL_DIR/index.html" > "$OUTPUT_DIR/index.html"

sed \
  -e "s|{{OPENCLAW_INDEX_JS}}|$OPENCLAW_INDEX_JS|g" \
  "$SHELL_DIR/mission-control-overview.html" > "$OUTPUT_DIR/mission-control-overview.html"

info "Copying command center overlay files..."
cp "$SHELL_DIR/mission-control-shell.js"     "$ASSETS_DIR/"
cp "$SHELL_DIR/mission-control-shell.css"    "$ASSETS_DIR/"
cp "$SHELL_DIR/theme-switcher.js"            "$ASSETS_DIR/"
cp "$SHELL_DIR/theme-switcher.css"           "$ASSETS_DIR/"
cp "$SHELL_DIR/theme-shanshui.css"           "$ASSETS_DIR/"
cp "$SHELL_DIR/theme-taohua.css"             "$ASSETS_DIR/"
cp "$SHELL_DIR/theme-qingci.css"             "$ASSETS_DIR/"
cp "$SHELL_DIR/mission-control-overview.css" "$ASSETS_DIR/"
cp "$SHELL_DIR/mission-control-overview.js"  "$ASSETS_DIR/"
cp "$SHELL_DIR/mission-control-preview.css"  "$ASSETS_DIR/"
cp "$SHELL_DIR/mission-control.html"         "$OUTPUT_DIR/"

mkdir -p "$OUTPUT_DIR/mission-control-assets"
cp -R "$SHELL_DIR/mission-control-assets/." "$OUTPUT_DIR/mission-control-assets/"
ok "Overlay assets copied"

ICONS_DIR="$SCRIPT_DIR/icons"
if [[ -d "$ICONS_DIR" ]]; then
  for file in favicon.svg favicon-32.png favicon.ico apple-touch-icon.png; do
    if [[ -f "$ICONS_DIR/$file" ]]; then
      cp "$ICONS_DIR/$file" "$OUTPUT_DIR/"
    fi
  done
  ok "Icons copied"
else
  warn "icons/ directory not found. Skipping icon copy."
fi

cat <<EOF

OpenClaw Command Center overlay generated successfully.

Output directory:
  $OUTPUT_DIR

Detected OpenClaw version:
  $OC_VERSION

Next steps:
  1. Mount this directory to /custom-ui in your OpenClaw container.
  2. Merge examples/openclaw.command-center.patch.json into your OpenClaw config.
  3. Use examples/docker-compose.command-center.override.yml if you need a mount example.
  4. Restart the deployment.
  5. If you want host diagnostics, run scripts/command-center-helper.mjs
     or use the PowerShell helper bootstrap scripts on Windows.
EOF
