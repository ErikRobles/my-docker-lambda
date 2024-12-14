FROM public.ecr.aws/lambda/nodejs:18

# Copy function code
COPY index.js package*.json ./

# Install dependencies
RUN npm install

# Command for Lambda
CMD [ "index.handler" ]
