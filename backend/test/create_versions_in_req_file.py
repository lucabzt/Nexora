import pkg_resources
import re

def get_installed_version(pkg_name):
    try:
        return pkg_resources.get_distribution(pkg_name).version
    except pkg_resources.DistributionNotFound:
        return None

input_file = "./requirements.txt"
output_file = "requirements_pinned.txt"

with open(input_file, "r") as f:
    lines = f.readlines()

updated_lines = []

for line in lines:
    line = line.strip()
    if not line or line.startswith("#"):
        updated_lines.append(line)
        continue

    # If line has == version
    if "==" in line:
        pkg, version = line.split("==")
        updated_lines.append(f"{pkg}~={version}")

    # If line has no version specifier
    elif re.match(r"^[a-zA-Z0-9_\-]+$", line):
        version = get_installed_version(line)
        if version:
            updated_lines.append(f"{line}~={version}")
        else:
            print(f"Warning: Could not find installed version for '{line}', leaving as-is")
            updated_lines.append(line)

    else:
        # Leave other forms untouched (e.g., >=, <=, etc.)
        updated_lines.append(line)

with open(output_file, "w") as f:
    f.write("\n".join(updated_lines))

print(f"Updated requirements written to: {output_file}")
