from pathlib import Path
from config import Config

# Test path resolution
print("Testing path resolution...")
print(f"Config.PLOTS_DIR: {Config.PLOTS_DIR}")
plots_dir = Path(Config.PLOTS_DIR)
print(f"Plots dir: {plots_dir}")
print(f"Plots dir absolute: {plots_dir.absolute()}")
print(f"Plots dir resolve: {plots_dir.resolve()}")
print(f"Plots dir exists: {plots_dir.exists()}")

# Test creating a file in the plots directory
test_file = plots_dir / "test.txt"
print(f"Test file path: {test_file}")
print(f"Test file path absolute: {test_file.absolute()}")
print(f"Test file path resolve: {test_file.resolve()}")
try:
    test_file.write_text("test")
    print("Successfully created test file")
    print(f"Test file exists: {test_file.exists()}")
    # Clean up
    test_file.unlink()
    print("Cleaned up test file")
except Exception as e:
    print(f"Error creating test file: {e}")