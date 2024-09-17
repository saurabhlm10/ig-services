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

PARAM_OVERRIDES=""

# Function to add parameters for a specific function from env.json
function add_params() {
    local func_name=$1
    # Extract parameters for the function and format them for SAM CLI
    local params=$(jq -r ".${func_name} | to_entries | map(\"\(.key)=\(.value)\") | .[]" "${env}.env.json" | xargs)
    for param in $params; do
        PARAM_OVERRIDES="$PARAM_OVERRIDES ParameterKey=${param%%=*},ParameterValue=${param#*=}"
    done
}

# Read each function name and collect all parameters
for func in $(jq -r 'keys[]' "${env}.env.json" ); do
    add_params $func
done

# Trim leading space
PARAM_OVERRIDES=$(echo $PARAM_OVERRIDES | xargs)

echo "Deploying with parameters: $PARAM_OVERRIDES"

# Deploy using SAM
sam deploy \
    --parameter-overrides $PARAM_OVERRIDES \
    --stack-name "quill-${env}" \
    --no-confirm-changeset \
#     --no-fail-on-empty-changeset

# Check if the deployment was successful
if [ $? -eq 0 ]; then
    echo "Deployment to $env environment completed successfully."
else
    echo "Error: Deployment to $env environment failed."
    exit 1
fi