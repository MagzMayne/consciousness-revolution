from setuptools import setup, find_packages

setup(
    name="haven-agent-finance",
    version="1.0.0",
    packages=find_packages(),
    # requests is an optional convenience dependency for teams that prefer it.
    # The default implementation uses only stdlib urllib and does not require it.
    install_requires=["requests>=2.28.0"],
    python_requires=">=3.8",
)
