package org.example.identity.mapper;

import org.example.identity.dto.request.RoleRequest;
import org.example.identity.dto.response.RoleResponse;
import org.example.identity.entity.Role;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RoleMapper {
    @Mapping(target = "id", ignore = true)
    Role toRole(RoleRequest request);

    @Mapping(source = "id", target = "id")
    RoleResponse toRoleResponse(Role role);
}
