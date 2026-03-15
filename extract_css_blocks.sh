#!/bin/bash
# Extract standard CSS blocks from Reality.html

echo "/* TIERED WHAT BELONGS CSS */"
sed -n '122,146p' Reality.html

echo -e "\n\n/* JOURNEY TRIPTYCH CSS */"
sed -n '172,196p' Reality.html

echo -e "\n\n/* WORLD ENGINE CSS */"
sed -n '197,221p' Reality.html

echo -e "\n\n/* NEWS PULSE CSS */"
sed -n '223,255p' Reality.html
