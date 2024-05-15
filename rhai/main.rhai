fn supergraph_service(service) {
  let add_headers_to_response = |response| {
    if response.context["set_response_headers"]?.len > 0 {
      response.headers["Cache-Control"] = response.context["set_response_headers"];
    }
  };

  service.map_response(add_headers_to_response);
}

fn subgraph_service(service, subgraph) {
  let store_headers_from_subgraphs = |response| {
    if "Cache-Control" in response.headers {
      if response.context["set_response_headers"] == () {
        response.context.set_response_headers = []
      }

      response.context.set_response_headers += response.headers.values("Cache-Control");
    }
  };

  service.map_response(store_headers_from_subgraphs);
}