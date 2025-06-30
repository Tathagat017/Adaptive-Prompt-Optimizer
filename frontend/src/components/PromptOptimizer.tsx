import React, { useState, useEffect } from "react";
import {
  Container,
  Title,
  Paper,
  Textarea,
  Select,
  Button,
  Stack,
  Text,
  Loader,
  Alert,
  Grid,
  Box,
  Badge,
  List,
  Divider,
} from "@mantine/core";
import {
  IconRocket,
  IconCheck,
  IconAlertCircle,
  IconBrain,
} from "@tabler/icons-react";
import { apiService } from "../services/api";
import { ToolInfo, OptimizationResponse } from "../types/api";

const PromptOptimizer: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [selectedTool, setSelectedTool] = useState<string>("");
  const [tools, setTools] = useState<ToolInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTools, setLoadingTools] = useState(true);
  const [result, setResult] = useState<OptimizationResponse | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    try {
      const toolsData = await apiService.getTools();
      setTools(toolsData);
      if (toolsData.length > 0) {
        setSelectedTool(toolsData[0].name);
      }
    } catch (err) {
      setError("Failed to load available tools");
      console.error("Failed to load tools:", err);
    } finally {
      setLoadingTools(false);
    }
  };

  const handleOptimize = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt to optimize");
      return;
    }

    if (!selectedTool) {
      setError("Please select a target tool");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const optimizationResult = await apiService.optimizePrompt({
        prompt,
        target_tool: selectedTool,
      });

      setResult(optimizationResult);
      setError("");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to optimize prompt";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const selectedToolInfo = tools.find((tool) => tool.name === selectedTool);

  if (loadingTools) {
    return (
      <Container size="lg" py="xl">
        <Stack align="center">
          <Loader size="lg" />
          <Text>Loading tools...</Text>
        </Stack>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Box ta="center">
          <Title order={1} c="blue" mb="md">
            <IconBrain
              size={40}
              style={{ verticalAlign: "middle", marginRight: "10px" }}
            />
            Adaptive Prompt Optimizer
          </Title>
          <Text size="lg" c="dimmed">
            Optimize your prompts for specific AI coding tools
          </Text>
        </Box>

        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper shadow="sm" p="lg" radius="md">
              <Stack gap="md">
                <Title order={3}>Input</Title>

                <Select
                  label="Target Tool"
                  placeholder="Select AI tool"
                  value={selectedTool}
                  onChange={(value) => setSelectedTool(value || "")}
                  data={tools.map((tool) => ({
                    value: tool.name,
                    label:
                      tool.name.charAt(0).toUpperCase() + tool.name.slice(1),
                  }))}
                  required
                />

                {selectedToolInfo && (
                  <Alert icon={<IconRocket />} color="blue" variant="light">
                    <Text size="sm">
                      <strong>{selectedToolInfo.name.toUpperCase()}</strong>:{" "}
                      {selectedToolInfo.description}
                    </Text>
                    <Badge
                      color={selectedToolInfo.has_tools ? "green" : "gray"}
                      size="sm"
                      mt="xs"
                    >
                      {selectedToolInfo.has_tools ? "Has Tools" : "No Tools"}
                    </Badge>
                  </Alert>
                )}

                <Textarea
                  label="Original Prompt"
                  placeholder="Enter your prompt here..."
                  value={prompt}
                  onChange={(event) => setPrompt(event.currentTarget.value)}
                  minRows={6}
                  maxRows={10}
                  required
                />

                <Button
                  onClick={handleOptimize}
                  loading={loading}
                  leftSection={<IconRocket size={16} />}
                  size="md"
                  fullWidth
                >
                  Optimize Prompt
                </Button>

                {error && (
                  <Alert icon={<IconAlertCircle />} color="red">
                    {error}
                  </Alert>
                )}
              </Stack>
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            {result ? (
              <Paper shadow="sm" p="lg" radius="md">
                <Stack gap="md">
                  <Title order={3}>Optimization Results</Title>

                  <Box>
                    <Text fw={500} mb="xs">
                      Optimized Prompt:
                    </Text>
                    <Paper p="md" bg="gray.0" radius="sm">
                      <Text
                        size="sm"
                        ff="monospace"
                        style={{ whiteSpace: "pre-wrap" }}
                      >
                        {result.optimized_prompt}
                      </Text>
                    </Paper>
                  </Box>

                  <Divider />

                  <Box>
                    <Text fw={500} mb="xs">
                      Optimizations Made:
                    </Text>
                    <List spacing="xs" size="sm">
                      {result.optimizations_made.map((optimization, index) => (
                        <List.Item
                          key={index}
                          icon={<IconCheck size={16} color="green" />}
                        >
                          {optimization}
                        </List.Item>
                      ))}
                    </List>
                  </Box>

                  <Divider />

                  <Box>
                    <Text fw={500} mb="xs">
                      Explanation:
                    </Text>
                    <Text size="sm" c="dimmed">
                      {result.explanation}
                    </Text>
                  </Box>

                  <Badge
                    color="blue"
                    variant="light"
                    size="lg"
                    style={{ alignSelf: "flex-start" }}
                  >
                    Optimized for {result.target_tool.toUpperCase()}
                  </Badge>
                </Stack>
              </Paper>
            ) : (
              <Paper
                shadow="sm"
                p="lg"
                radius="md"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "400px",
                }}
              >
                <Stack align="center" gap="md">
                  <IconBrain size={64} color="gray" />
                  <Text size="lg" c="dimmed" ta="center">
                    Enter a prompt and click "Optimize Prompt" to see the
                    results
                  </Text>
                </Stack>
              </Paper>
            )}
          </Grid.Col>
        </Grid>

        {result && (
          <Paper shadow="sm" p="lg" radius="md">
            <Title order={4} mb="md">
              Before & After Comparison
            </Title>
            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Text fw={500} mb="xs">
                  Original Prompt:
                </Text>
                <Paper p="md" bg="gray.0" radius="sm">
                  <Text
                    size="sm"
                    ff="monospace"
                    style={{ whiteSpace: "pre-wrap" }}
                  >
                    {result.original_prompt}
                  </Text>
                </Paper>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Text fw={500} mb="xs">
                  Optimized Prompt:
                </Text>
                <Paper p="md" bg="gray.0" radius="sm">
                  <Text
                    size="sm"
                    ff="monospace"
                    style={{ whiteSpace: "pre-wrap" }}
                  >
                    {result.optimized_prompt}
                  </Text>
                </Paper>
              </Grid.Col>
            </Grid>
          </Paper>
        )}
      </Stack>
    </Container>
  );
};

export default PromptOptimizer;
