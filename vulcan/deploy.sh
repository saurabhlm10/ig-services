#!/bin/bash

# Check if the environment argument is provided
if [ $# -eq 0 ]; then
    echo "Error: No environment specified. Usage: $0 <env>"
    exit 1
fi

# Get the environment from the first argument
env=$1

# Validate the environment
if [ "$env" != "dev" ] && [ "$env" != "prod" ]; then
    echo "Error: Invalid environment. Use 'dev' or 'prod'."
    exit 1
fi

# Set the environment file based on the environment
env_file="${env}.env.json"

# Check if the environment file exists
if [ ! -f "$env_file" ]; then
    echo "Error: Environment file $env_file not found."
    exit 1
fi

# Load environment variables from the JSON file
env_vars=$(jq -r 'to_entries | map("ParameterKey=\(.key),ParameterValue=\(.value)") | join(" ")' "$env_file")

# Deploy using SAM
sam deploy \
    --template-file template.yaml \
    --stack-name "vulcan-${env}" \
    --capabilities CAPABILITY_IAM \
    --parameter-overrides $env_vars \
    --no-confirm-changeset \
    --no-fail-on-empty-changeset

# Check if the deployment was successful
if [ $? -eq 0 ]; then
    echo "Deployment to $env environment completed successfully."
else
    echo "Error: Deployment to $env environment failed."
    exit 1
fi