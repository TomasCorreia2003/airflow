/*!
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { setupServer, type SetupServerApi } from "msw/node";
import { afterEach, describe, it, expect, beforeAll, afterAll } from "vitest";

import type { DAGDetailsResponse } from "openapi/requests/types.gen";
import { handlers } from "src/mocks/handlers";
import { MOCK_DAG } from "src/mocks/handlers/dag";
import { Wrapper } from "src/utils/Wrapper";

import { Header } from "./Header";

let server: SetupServerApi;

beforeAll(() => {
  server = setupServer(...handlers);
  server.listen({ onUnhandledRequest: "bypass" });
});

afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("Dag Documentation Modal", () => {
  it("Display documentation button when doc_md is present", async () => {
    render(
      <Wrapper>
        <Header dag={MOCK_DAG as unknown as DAGDetailsResponse} />
      </Wrapper>,
    );

    await waitFor(() => expect(screen.getByTestId("markdown-button")).toBeInTheDocument());
    await waitFor(() => screen.getByTestId("markdown-button").click());
    await waitFor(() =>
      expect(screen.getByText(/taskflow api tutorial documentation/iu)).toBeInTheDocument(),
    );
  });

  it("Do not display documentation button only doc_md is not present", () => {
    render(
      <Wrapper>
        {/* eslint-disable-next-line unicorn/no-null */}
        <Header dag={{ ...MOCK_DAG, doc_md: null } as unknown as DAGDetailsResponse} />
      </Wrapper>,
    );

    expect(screen.queryByTestId("markdown-button")).toBeNull();
  });

  it("shows a deactivated badge and hides active dag controls for stale dags", () => {
    render(
      <Wrapper>
        <Header
          dag={
            {
              ...MOCK_DAG,
              is_stale: true,
              next_dagrun_logical_date: "2025-01-14T00:00:00Z",
              next_dagrun_run_after: "2025-01-14T00:00:00Z",
            } as unknown as DAGDetailsResponse
          }
        />
      </Wrapper>,
    );

    expect(screen.getByTestId("dag-deactivated-badge")).toBeInTheDocument();
    expect(screen.queryByTestId("toggle-pause")).not.toBeInTheDocument();
    expect(screen.queryByText("Next Run")).not.toBeInTheDocument();
  });
});
