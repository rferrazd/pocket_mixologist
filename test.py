import inspect
import langgraph.prebuilt
import os

import langgraph.prebuilt.tool_node

# Print what kind of object langgraph.prebuilt is
print(f"Type of langgraph.prebuilt: {type(langgraph.prebuilt)}")

# List the actual files/modules in the prebuilt directory
prebuilt_path = langgraph.prebuilt.__path__[0]
print(f"\nContents of {prebuilt_path}:")
for item in os.listdir(prebuilt_path):
    print(f"  - {item}")

# Try to import and see available submodules
print("\nTrying to import submodules:")
for item in os.listdir(prebuilt_path):
    if item.endswith('.py') and not item.startswith('__'):
        module_name = item[:-3]  # Remove .py extension
        print(f"Contents of langgraph.prebuilt.{module_name}:")
        try:
            module = __import__(f"langgraph.prebuilt.{module_name}", fromlist=['*'])
            print(f"  - {dir(module)}")
        except ImportError as e:
            print(f"  - Error importing: {e}")

print(dir(langgraph.prebuilt))
print(inspect.getmembers(langgraph.prebuilt))

# To get more info specifically about ToolNode
print("\n\nToolNode documentation:")
#help(langgraph.prebuilt.tool_node)


from langgraph.prebuilt.tool_node import ToolNode